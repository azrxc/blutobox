"use client";

import dynamic from "next/dynamic";

export const AdventureTool = dynamic(() => import("./adventure-tool").then((m) => m.AdventureTool), { ssr: false });
