"use client";

import dynamic from "next/dynamic";

export const QrTool = dynamic(() => import("./qr-tool").then((m) => m.QrTool), { ssr: false });
