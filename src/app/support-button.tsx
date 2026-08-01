"use client";

import { useEffect, useState } from "react";

export function SupportButton() {
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/stripe/support")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setAvailable(Boolean(data?.available)))
      .catch(() => {});
  }, []);

  if (!available) return null;

  async function handleClick() {
    setLoading(true);
    const res = await fetch("/api/stripe/support", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (data.url) window.location.href = data.url;
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="transition-colors hover:text-foreground disabled:opacity-50"
    >
      {loading ? "…" : "Support us"}
    </button>
  );
}
