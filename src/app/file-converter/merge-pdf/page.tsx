import type { Metadata } from "next";
import { ToolPageLayout } from "../tool-page-layout";
import { PdfMergeConverter } from "../lazy-tools";

export const metadata: Metadata = {
  title: "Merge PDF Files Free | Bluto Box",
  description: "Combine multiple PDFs into one file, free, right in your browser. No upload, no sign-up, no watermark.",
};

export default function MergePdfPage() {
  return (
    <ToolPageLayout
      title="Merge PDF files"
      intro="Combine multiple PDFs into one, in the order you choose."
      structuredDataPath="/file-converter/merge-pdf"
      structuredDataDescription="Combine multiple PDFs into one file, free, right in your browser. No upload, no sign-up, no watermark."
    >
      <PdfMergeConverter />
    </ToolPageLayout>
  );
}
