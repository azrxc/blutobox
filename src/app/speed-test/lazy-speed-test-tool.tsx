"use client";

import dynamic from "next/dynamic";

export const SpeedTestTool = dynamic(() => import("./speed-test-tool").then((m) => m.SpeedTestTool), { ssr: false });
