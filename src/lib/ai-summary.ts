// Import the internal implementation directly, not the package's main entry -
// pdf-parse@1.x's index.js has a leftover debug-mode block that misfires when
// bundled (misdetects `module.parent`), trying to read a test fixture PDF that
// doesn't exist outside the package's own repo and crashing on import. This path
// bypasses that wrapper entirely - a known, documented workaround for this package.
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { prisma } from "@/lib/prisma";
import { getSignedDownloadUrl } from "@/lib/storage";
import { isAIConfigured, chatCompletion } from "@/lib/deepseek";

// Independent of plan upload/storage limits (src/lib/limits.ts) - this is a fixed,
// feature-level cost/latency bound, not a plan quota, so it's kept local here.
// Exported so the file page can decide whether to show the "Generate" button at all.
export const MAX_SUMMARY_FILE_BYTES = 20 * 1024 * 1024; // 20MB

// Caps worst-case cost per call regardless of source file size - applies to both
// plain-text content and text extracted from a PDF.
const TEXT_EXCERPT_MAX_CHARS = 50_000;

const TEXT_MIME_EXTRAS = new Set(["application/json", "application/xml"]);

// Exported so the file page can decide whether to show the "Generate" button at all.
export function classifyMimeType(mimeType: string): "pdf" | "text" | null {
  const mt = mimeType.toLowerCase();
  if (mt === "application/pdf") return "pdf";
  if (mt.startsWith("text/") || TEXT_MIME_EXTRAS.has(mt)) return "text";
  return null;
}

const SUMMARY_SYSTEM_PROMPT =
  "You write short public-facing summaries shown on a file-sharing page, so a " +
  "visitor knows what's in a file before downloading it. In 2-3 plain sentences, " +
  "describe what the attached document contains and its likely purpose. Do not " +
  "start with a preamble like \"This document is...\" - describe the content " +
  "directly. If the content looks sensitive or personal (medical, financial, " +
  "private correspondence, credentials, etc.), keep the summary generic and do " +
  "not quote specific details.";

export type SummaryResult = { ok: true; summary: string } | { ok: false; reason: string };

// Triggered on-demand by a viewer clicking "Generate AI summary" (src/app/api/files/[slug]/generate-summary/route.ts),
// not automatically at upload time - eligibility no longer depends on the file
// owner's plan at all, only the file's own type/size. The caller (the API route)
// is responsible for the viewer's own quota check before calling this - this
// function only handles whether the FILE is eligible and doing the actual work.
// Never throws - always resolves to a result the caller can relay to the UI.
export async function generateFileSummary(fileId: string): Promise<SummaryResult> {
  try {
    if (!isAIConfigured()) return { ok: false, reason: "AI summaries aren't configured yet" };

    const file = await prisma.file.findUnique({ where: { id: fileId } });
    if (!file) return { ok: false, reason: "File not found" };

    const kind = classifyMimeType(file.mimeType);
    if (!kind) return { ok: false, reason: "This file type isn't eligible for AI summaries" };
    if (file.sizeBytes > BigInt(MAX_SUMMARY_FILE_BYTES)) {
      return { ok: false, reason: "File is too large for an AI summary" };
    }

    const signedUrl = await getSignedDownloadUrl(file.b2Key);
    const res = await fetch(signedUrl);
    if (!res.ok) return { ok: false, reason: "Couldn't read the file" };

    let excerpt: string;
    if (kind === "pdf") {
      const buf = Buffer.from(await res.arrayBuffer());
      const result = await pdfParse(buf);
      excerpt = result.text.slice(0, TEXT_EXCERPT_MAX_CHARS).trim();
    } else {
      excerpt = (await res.text()).slice(0, TEXT_EXCERPT_MAX_CHARS).trim();
    }
    if (!excerpt) return { ok: false, reason: "Couldn't extract any text from this file" };

    const completion = await chatCompletion({
      max_tokens: 300,
      messages: [
        { role: "system", content: SUMMARY_SYSTEM_PROMPT },
        { role: "user", content: excerpt },
      ],
    });

    const summary = completion.choices[0]?.message?.content?.trim();
    if (!summary) return { ok: false, reason: "AI summary came back empty" };

    await prisma.file.update({
      where: { id: fileId },
      data: { aiSummary: summary, aiSummaryGeneratedAt: new Date() },
    });

    return { ok: true, summary };
  } catch (err) {
    console.error("[ai-summary] generation failed for file", fileId, err);
    return { ok: false, reason: "Something went wrong generating the summary" };
  }
}
