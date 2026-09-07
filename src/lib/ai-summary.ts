import OpenAI from "openai";
import { PDFParse } from "pdf-parse";
import { prisma } from "@/lib/prisma";
import { getSignedDownloadUrl } from "@/lib/storage";
import { effectivePlanTier } from "@/lib/plan";

// DeepSeek's API is OpenAI-compatible - same SDK, different base URL/model. Chosen
// over Claude/GPT for this feature specifically because it's dramatically cheaper
// per token, and a short public-facing summary doesn't need frontier-level quality.
const MODEL = "deepseek-chat";

// Independent of plan upload/storage limits (src/lib/limits.ts) - this is a fixed,
// feature-level cost/latency bound, not a plan quota, so it's kept local here.
const MAX_SUMMARY_FILE_BYTES = 20 * 1024 * 1024; // 20MB

// Caps worst-case cost per call regardless of source file size - applies to both
// plain-text content and text extracted from a PDF.
const TEXT_EXCERPT_MAX_CHARS = 50_000;

// Free accounts get a small lifetime taste of this Pro perk - bounded, predictable
// cost (a few cents at most per account, ever), not an ongoing free-tier expense.
const FREE_LIFETIME_SUMMARY_LIMIT = 2;

const TEXT_MIME_EXTRAS = new Set(["application/json", "application/xml"]);

function classifyMimeType(mimeType: string): "pdf" | "text" | null {
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

let cachedClient: OpenAI | null | undefined;
function getClient(): OpenAI | null {
  if (cachedClient !== undefined) return cachedClient;
  const apiKey = process.env.DEEPSEEK_API_KEY;
  cachedClient = apiKey ? new OpenAI({ apiKey, baseURL: "https://api.deepseek.com/v1" }) : null;
  return cachedClient;
}

// Fire-and-forget, best-effort, one-shot: called once via `after()` right after any
// logged-in user's upload completes. Never throws - on any failure (ineligible
// file, missing key, fetch error, API error, empty response) it just returns,
// leaving File.aiSummary null, same fail-open shape as src/lib/virustotal.ts.
export async function generateAndStoreFileSummary(fileId: string): Promise<void> {
  try {
    const client = getClient();
    if (!client) return; // DEEPSEEK_API_KEY not configured yet - silent no-op

    const file = await prisma.file.findUnique({
      where: { id: fileId },
      include: { owner: { select: { id: true, planTier: true, proPassExpiresAt: true, freeAiSummariesUsed: true } } },
    });
    if (!file || !file.owner) return; // anonymous upload - never eligible

    const isPro = effectivePlanTier(file.owner) === "PRO";
    if (!isPro && file.owner.freeAiSummariesUsed >= FREE_LIFETIME_SUMMARY_LIMIT) return;

    const kind = classifyMimeType(file.mimeType);
    if (!kind) return;
    if (file.sizeBytes > BigInt(MAX_SUMMARY_FILE_BYTES)) return;

    const signedUrl = await getSignedDownloadUrl(file.b2Key);
    const res = await fetch(signedUrl);
    if (!res.ok) return;

    let excerpt: string;
    if (kind === "pdf") {
      const buf = Buffer.from(await res.arrayBuffer());
      const parser = new PDFParse({ data: buf });
      const result = await parser.getText();
      excerpt = result.text.slice(0, TEXT_EXCERPT_MAX_CHARS).trim();
    } else {
      excerpt = (await res.text()).slice(0, TEXT_EXCERPT_MAX_CHARS).trim();
    }
    if (!excerpt) return;

    const completion = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 300,
      messages: [
        { role: "system", content: SUMMARY_SYSTEM_PROMPT },
        { role: "user", content: excerpt },
      ],
    });

    const summary = completion.choices[0]?.message?.content?.trim();
    if (!summary) return;

    await prisma.file.update({
      where: { id: fileId },
      data: { aiSummary: summary, aiSummaryGeneratedAt: new Date() },
    });

    if (!isPro) {
      await prisma.user.update({
        where: { id: file.owner.id },
        data: { freeAiSummariesUsed: { increment: 1 } },
      });
    }
  } catch (err) {
    console.error("[ai-summary] generation failed for file", fileId, err);
    // Fail silently - same pattern as src/lib/virustotal.ts's fail-open check.
  }
}
