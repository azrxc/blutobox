import type { Metadata } from "next";
import { ToolPageLayout } from "../tool-page-layout";
import { PdfToImagesConverter } from "../pdf-to-images-converter";

export const metadata: Metadata = {
  title: "Convert PDF to JPG Free | Bluto Box",
  description: "Turn every page of a PDF into a JPG image, free, right in your browser. No upload, no sign-up.",
};

export default function PdfToJpgPage() {
  return (
    <ToolPageLayout title="Convert PDF to JPG" intro="Every page becomes its own image.">
      <PdfToImagesConverter />
    </ToolPageLayout>
  );
}
