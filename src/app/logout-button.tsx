"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <span className="flex items-center gap-2">
        <span className="text-muted">Log out?</span>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="font-medium text-red-600 underline transition-colors hover:opacity-80 dark:text-red-400"
        >
          Yes
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="underline transition-colors hover:text-foreground"
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button onClick={() => setConfirming(true)} className="underline transition-colors hover:text-foreground">
      Log out
    </button>
  );
}
