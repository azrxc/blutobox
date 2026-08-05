import type { Metadata } from "next";
import { QrTool } from "./qr-tool";

export const metadata: Metadata = {
  title: "Free QR Code Generator | Bluto Box",
  description: "Turn any link or text into a scannable QR code, free, no sign-up required.",
};

export default function QrPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <QrTool />
    </main>
  );
}
