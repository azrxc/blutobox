import type { Metadata } from "next";
import { ToolPageLayout } from "../tool-page-layout";
import { ImageCompressor } from "../image-compressor";

export const metadata: Metadata = {
  title: "Compress Image Online Free | Bluto Box",
  description: "Shrink an image's file size for free, right in your browser. No upload, no sign-up, no watermark.",
};

export default function CompressImagePage() {
  return (
    <ToolPageLayout title="Compress an image" intro="Pick a target size, we'll get as close as we can.">
      <ImageCompressor />
    </ToolPageLayout>
  );
}
