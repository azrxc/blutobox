import type { Metadata } from "next";
import { ToolPageLayout } from "../tool-page-layout";
import { ImageFormatConverter } from "../lazy-tools";

export const metadata: Metadata = {
  title: "Convert PNG to WebP Free | Bluto Box",
  description: "Convert PNG images to WebP for free, right in your browser. No upload, no sign-up, no watermark.",
};

export default function PngToWebpPage() {
  return (
    <ToolPageLayout
      title="Convert PNG to WebP"
      intro="Smaller file size, same image quality."
      structuredDataPath="/file-converter/png-to-webp"
      structuredDataDescription="Convert PNG images to WebP for free, right in your browser. No upload, no sign-up, no watermark."
    >
      <ImageFormatConverter initialFormat="webp" />
    </ToolPageLayout>
  );
}
