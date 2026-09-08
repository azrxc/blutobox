"use client";

import dynamic from "next/dynamic";

export const DailyCharacterTool = dynamic(
  () => import("./daily-character-tool").then((m) => m.DailyCharacterTool),
  { ssr: false }
);
