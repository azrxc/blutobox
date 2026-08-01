"use client";

import { useState } from "react";
import QRCode from "qrcode";

export function QrCodeButton({ url }: { url: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  async function toggle() {
    if (!show && !dataUrl) {
      const generated = await QRCode.toDataURL(url, { margin: 1, width: 240 });
      setDataUrl(generated);
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
      {show && dataUrl && (
        <div className="absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 rounded-xl border border-border bg-surface p-3 shadow-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dataUrl} alt="QR code for this link" width={160} height={160} />
        </div>
      )}
    </div>
  );
}
