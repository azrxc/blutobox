"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import QRCode from "qrcode";
import { svgToPngDataUrl } from "../qr-to-png";

const DOWNLOAD_SIZE = 1024;

export function QrTool() {
  const { data: session } = useSession();
  const isPro = session?.user?.planTier === "PRO";

  const [text, setText] = useState("");
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [darkColor, setDarkColor] = useState("#000000");
  const [lightColor, setLightColor] = useState("#ffffff");
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);

  function handleLogoChange(file: File | null) {
    if (!file) {
      setLogoDataUrl(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!text.trim()) return;
    try {
      const generated = await QRCode.toString(text.trim(), {
        type: "svg",
        margin: 1,
        width: 280,
        color: isPro ? { dark: darkColor, light: lightColor } : undefined,
        errorCorrectionLevel: isPro && logoDataUrl ? "H" : undefined,
      });
      setSvg(generated);
    } catch {
      setError("Failed to generate QR code.");
      setSvg(null);
    }
  }

  async function handleDownload() {
    if (!text.trim()) return;
    setDownloading(true);
    setError(null);
    try {
      const highRes = await QRCode.toString(text.trim(), {
        type: "svg",
        margin: 1,
        width: DOWNLOAD_SIZE,
        color: isPro ? { dark: darkColor, light: lightColor } : undefined,
        errorCorrectionLevel: isPro && logoDataUrl ? "H" : undefined,
      });
      const pngDataUrl = await svgToPngDataUrl(highRes, DOWNLOAD_SIZE, isPro ? (logoDataUrl ?? undefined) : undefined);
      const link = document.createElement("a");
      link.href = pngDataUrl;
      link.download = "qr-code.png";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setError("Failed to generate PNG download.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div>
        <h1 className="text-xl font-semibold">QR code generator</h1>
        <p className="mt-1 text-sm text-muted">Turn any link or text into a scannable QR code. Free, no sign-up.</p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <form onSubmit={handleGenerate} className="flex gap-2">
        <input
          type="text"
          required
          placeholder="https://example.com or any text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-foreground/30"
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-85"
        >
          Generate
        </button>
      </form>

      <details className="group rounded-xl border border-border bg-surface">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium marker:content-none">
          <span>Customize {!isPro && <span className="text-muted">(Pro)</span>}</span>
          <span className="text-muted transition-transform group-open:rotate-180">⌄</span>
        </summary>
        <div className="space-y-3 border-t border-border p-4">
          {isPro ? (
            <>
              <div className="flex gap-3">
                <div className="flex-1 space-y-1">
                  <label className="text-xs text-muted" htmlFor="darkColor">
                    Foreground
                  </label>
                  <input
                    id="darkColor"
                    type="color"
                    value={darkColor}
                    onChange={(e) => setDarkColor(e.target.value)}
                    className="h-9 w-full rounded-lg border border-border bg-background"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-xs text-muted" htmlFor="lightColor">
                    Background
                  </label>
                  <input
                    id="lightColor"
                    type="color"
                    value={lightColor}
                    onChange={(e) => setLightColor(e.target.value)}
                    className="h-9 w-full rounded-lg border border-border bg-background"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted" htmlFor="logo">
                  Center logo (optional)
                </label>
                <input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleLogoChange(e.target.files?.[0] ?? null)}
                  className="w-full text-xs text-muted"
                />
              </div>
            </>
          ) : (
            <p className="text-xs text-muted">
              <Link href="/pricing" className="underline underline-offset-2">
                Upgrade to Pro
              </Link>{" "}
              to set custom colors and add a logo to your QR codes.
            </p>
          )}
        </div>
      </details>

      {svg && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-6">
          <div className="relative rounded-xl bg-white p-4">
            <div dangerouslySetInnerHTML={{ __html: svg }} />
            {isPro && logoDataUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoDataUrl}
                alt=""
                className="absolute top-1/2 left-1/2 w-[22%] -translate-x-1/2 -translate-y-1/2 rounded bg-white p-1"
              />
            )}
          </div>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-background disabled:opacity-50"
          >
            {downloading ? "Preparing…" : "Download QR"}
          </button>
        </div>
      )}

      <p className="text-center text-xs text-muted">
        Generated entirely in your browser. Nothing you enter here is ever sent to a server.
      </p>
    </div>
  );
}
