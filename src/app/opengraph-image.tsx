import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Bluto Box - upload and share files, free AI tools too";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Root-level default OG image - Next.js falls back to this for any page that
// doesn't define its own opengraph-image, so this one file covers every route
// (upload, pricing, comparison pages, AI hub, etc.) that previously all shared
// a plain favicon-sized icon.png as their social preview.
export default async function Image() {
  const logoData = await readFile(join(process.cwd(), "public/logo.png"));
  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fafaf8",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={88} height={88} alt="" />
          <span style={{ fontSize: 92, fontWeight: 600, color: "#16150f", letterSpacing: "-0.02em" }}>
            Bluto Box
          </span>
        </div>
        <span style={{ marginTop: 28, fontSize: 32, color: "#6b6a63" }}>
          Upload and share files, free AI tools too
        </span>
      </div>
    ),
    { ...size }
  );
}
