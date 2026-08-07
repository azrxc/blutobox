import type { Metadata } from "next";
import { ToolPageLayout } from "../tool-page-layout";
import { DocToPdfConverter } from "../lazy-tools";

export const metadata: Metadata = {
  title: "Convert Word to PDF Free | Bluto Box",
  description: "Convert a .docx Word document to PDF for free, right in your browser. No upload, no sign-up.",
};

export default function WordToPdfPage() {
  return (
    <ToolPageLayout
      title="Convert Word to PDF"
      intro="Turn a .docx file into a PDF."
      structuredDataPath="/file-converter/word-to-pdf"
      structuredDataDescription="Convert a .docx Word document to PDF for free, right in your browser. No upload, no sign-up."
    >
      <DocToPdfConverter />
    </ToolPageLayout>
  );
}
