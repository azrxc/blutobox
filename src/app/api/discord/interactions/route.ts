import { NextResponse, after } from "next/server";
import { randomUUID } from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getS3Client, B2_BUCKET } from "@/lib/storage";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/slug";
import { verifyDiscordSignature, sendDiscordFollowup } from "@/lib/discord";
import { ANON_MAX_UPLOAD_BYTES } from "@/lib/limits";

export const maxDuration = 60;

type DiscordAttachment = {
  url: string;
  filename: string;
  size: number;
  content_type?: string;
};

type DiscordInteraction = {
  type: number;
  token: string;
  data?: {
    name?: string;
    options?: { name: string; value: string }[];
    resolved?: { attachments?: Record<string, DiscordAttachment> };
  };
};

async function relayAttachment(attachment: DiscordAttachment, interactionToken: string) {
  if (attachment.size > ANON_MAX_UPLOAD_BYTES) {
    const limitMb = Math.floor(ANON_MAX_UPLOAD_BYTES / (1024 * 1024));
    await sendDiscordFollowup(interactionToken, `That file is too large, the limit is ${limitMb}MB.`);
    return;
  }

  try {
    const res = await fetch(attachment.url);
    if (!res.ok) throw new Error("Failed to fetch attachment from Discord");
    const buffer = Buffer.from(await res.arrayBuffer());

    const key = `uploads/${randomUUID()}/${attachment.filename}`;
    const s3 = getS3Client();
    await s3.send(
      new PutObjectCommand({
        Bucket: B2_BUCKET(),
        Key: key,
        Body: buffer,
        ContentType: attachment.content_type || "application/octet-stream",
      })
    );

    const file = await prisma.file.create({
      data: {
        ownerId: null,
        uploaderIp: "discord-bot",
        filename: attachment.filename,
        sizeBytes: BigInt(attachment.size),
        mimeType: attachment.content_type || "application/octet-stream",
        b2Key: key,
        isNsfw: false,
      },
    });
    const slug = generateSlug();
    await prisma.shareLink.create({ data: { fileId: file.id, slug } });

    const fileUrl = `${process.env.NEXTAUTH_URL}/f/${slug}`;
    await sendDiscordFollowup(interactionToken, `Here's your link: ${fileUrl}`);
  } catch {
    await sendDiscordFollowup(interactionToken, "Something went wrong uploading that file, try again.");
  }
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-signature-ed25519");
  const timestamp = req.headers.get("x-signature-timestamp");

  if (!verifyDiscordSignature(rawBody, signature, timestamp)) {
    return new NextResponse("Invalid request signature", { status: 401 });
  }

  const interaction: DiscordInteraction = JSON.parse(rawBody);

  // PING - Discord's handshake check when you first set the interactions endpoint URL.
  if (interaction.type === 1) {
    return NextResponse.json({ type: 1 });
  }

  // APPLICATION_COMMAND
  if (interaction.type === 2 && interaction.data?.name === "share") {
    const attachmentId = interaction.data.options?.find((o) => o.name === "file")?.value;
    const attachment = attachmentId ? interaction.data.resolved?.attachments?.[attachmentId] : undefined;

    if (!attachment) {
      return NextResponse.json({ type: 4, data: { content: "Attach a file to share." } });
    }

    // Discord requires an ack within 3 seconds. Fetching and re-uploading the file
    // takes longer than that, so defer now and send the real result via a follow-up
    // webhook once relayAttachment finishes (after() keeps the function alive for it).
    after(() => relayAttachment(attachment, interaction.token));
    return NextResponse.json({ type: 5 });
  }

  return NextResponse.json({ type: 4, data: { content: "Unknown command." } });
}
