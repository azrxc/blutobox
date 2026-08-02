"use client";

import { useState } from "react";
import QRCode from "qrcode";
import { svgToPngDataUrl } from "./qr-to-png";

const DOWNLOAD_SIZE = 1024;

export function QrCodeButton({ url }: { url: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);
  const [downloading, setDownloading] = useState(false);

  async function toggle() {
    if (!show && !svg) {
      try {
        const generated = await QRCode.toString(url, { type: "svg", margin: 1, width: 220 });
        setSvg(generated);
      } catch {
        setError(true);
      }
    }
    setShow((s) => !s);
  }

  async function handleDownload() {
    setDownloading(true);
    try {
      const highRes = await QRCode.toString(url, { type: "svg", margin: 1, width: DOWNLOAD_SIZE });
      const pngDataUrl = await svgToPngDataUrl(highRes, DOWNLOAD_SIZE);
      const link = document.createElement("a");
      link.href = pngDataUrl;
      link.download = "qr-code.png";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setError(true);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      <button
        onClick={toggle}
        className="rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-background"
      >
        {show ? "Hide QR" : "QR code"}
      </button>
      {show && svg && (
        <div className="mt-4 flex w-full flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-6">
          <div className="rounded-xl bg-white p-4" dangerouslySetInnerHTML={{ __html: svg }} />
          <p className="text-xs text-muted">Scan to open this link</p>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-background disabled:opacity-50"
          >
            {downloading ? "Preparing…" : "Download QR"}
          </button>
        </div>
      )}
      {show && error && (
        <div className="mt-4 w-full rounded-2xl border border-border bg-surface p-6 text-center text-sm text-red-500">
          Failed to generate QR code.
        </div>
      )}
    </>
  );
}
