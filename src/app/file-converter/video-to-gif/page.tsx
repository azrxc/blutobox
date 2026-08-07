import type { Metadata } from "next";
import { ToolPageLayout } from "../tool-page-layout";
import { VideoToGifConverter } from "../lazy-tools";

export const metadata: Metadata = {
  title: "Convert Video to GIF Free | Bluto Box",
  description: "Turn a short video clip into a GIF, free, right in your browser. No upload, no sign-up, no watermark.",
};

export default function VideoToGifPage() {
  return (
    <ToolPageLayout
      title="Convert video to GIF"
      intro="Turn a short clip into a looping GIF."
      structuredDataPath="/file-converter/video-to-gif"
      structuredDataDescription="Turn a short video clip into a GIF, free, right in your browser. No upload, no sign-up, no watermark."
    >
      <VideoToGifConverter />
    </ToolPageLayout>
  );
}
