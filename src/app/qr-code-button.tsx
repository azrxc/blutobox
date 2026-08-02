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
        title={show ? "Hide QR code" : "Show QR code"}
        aria-label={show ? "Hide QR code" : "Show QR code"}
        aria-pressed={show}
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors ${
          show
            ? "border-transparent bg-accent text-accent-foreground"
            : "border-border text-muted hover:bg-background hover:text-foreground"
        }`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <path d="M14 14h3v3" />
          <path d="M21 21v-.01" />
          <path d="M14 21v-3" />
          <path d="M21 14h-.01" />
        </svg>
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
