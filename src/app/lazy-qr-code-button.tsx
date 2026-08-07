"use client";

import dynamic from "next/dynamic";

// See file-converter/lazy-tools.tsx for why this indirection exists: ssr:false has to be
// called from inside a Client Component, and excluding the component from SSR entirely
// (not just deferring its import()) is what actually keeps it out of the compiled Worker.
export const QrCodeButton = dynamic(() => import("./qr-code-button").then((m) => m.QrCodeButton), { ssr: false });
