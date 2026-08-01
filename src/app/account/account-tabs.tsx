"use client";

import { useState, type ReactNode } from "react";

const TABS = ["Overview", "Files", "Profile", "Creator"] as const;
type Tab = (typeof TABS)[number];

export function AccountTabs({
  overview,
  files,
  profile,
  creator,
}: {
  overview: ReactNode;
  files: ReactNode;
  profile: ReactNode;
  creator: ReactNode;
}) {
  const [active, setActive] = useState<Tab>("Overview");
  const panels: Record<Tab, ReactNode> = { Overview: overview, Files: files, Profile: profile, Creator: creator };

  return (
    <div>
      <div className="flex gap-1 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              active === tab
                ? "border-b-2 border-foreground text-foreground"
                : "text-muted hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="pt-8">{panels[active]}</div>
    </div>
  );
}
