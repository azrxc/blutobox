"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";

export function GoogleSignInButton() {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    fetch("/api/auth/providers")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setAvailable(Boolean(data?.google)))
      .catch(() => {});
  }, []);

  if (!available) return null;

  return (
    <>
      <div className="flex items-center gap-3 text-xs text-muted">
        <div className="h-px flex-1 bg-border" />
        or
        <div className="h-px flex-1 bg-border" />
      </div>
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/?welcome=1" })}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-border py-3 text-sm font-medium transition-colors hover:bg-surface"
      >
        Continue with Google
      </button>
    </>
  );
}
