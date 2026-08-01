"use client";

import { useState } from "react";
import QRCode from "qrcode";

export function QrCodeButton({ url }: { url: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);

  async function toggle() {
    if (!show && !svg) {
      try {
        const generated = await QRCode.toString(url, { type: "svg", margin: 1, width: 200 });
        setSvg(generated);
      } catch {
        setError(true);
      }
    }
    setShow((s) => !s);
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={toggle}
        className="rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-background"
      >
        {show ? "Hide QR" : "QR code"}
      </button>
      {show && svg && (
        <div
          className="absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 rounded-xl border border-border bg-white p-3 shadow-lg"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      )}
      {show && error && (
        <div className="absolute left-1/2 top-full z-10 mt-2 w-48 -translate-x-1/2 rounded-xl border border-border bg-surface p-3 text-xs text-red-500 shadow-lg">
          Failed to generate QR code.
        </div>
      )}
    </div>
  );
}
