import type { Metadata } from "next";
import { ToolPageLayout } from "../tool-page-layout";
import { ImageFormatConverter } from "../lazy-tools";

export const metadata: Metadata = {
  title: "Convert JPG to PNG Free | Bluto Box",
  description: "Convert JPG images to PNG for free, right in your browser. No upload, no sign-up, no watermark.",
};

export default function JpgToPngPage() {
  return (
    <ToolPageLayout title="Convert JPG to PNG" intro="Lossless format, transparency support.">
      <ImageFormatConverter initialFormat="png" />
    </ToolPageLayout>
  );
}
