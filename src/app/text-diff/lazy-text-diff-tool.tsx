"use client";

import dynamic from "next/dynamic";

export const TextDiffTool = dynamic(() => import("./text-diff-tool").then((m) => m.TextDiffTool), { ssr: false });
