"use client";

import dynamic from "next/dynamic";

export const TriviaTool = dynamic(() => import("./trivia-tool").then((m) => m.TriviaTool), { ssr: false });
