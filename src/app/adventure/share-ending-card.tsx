"use client";

import { useState } from "react";

const WIDTH = 1200;
const HEIGHT = 630;

// Fixed light palette regardless of viewer's site theme - a shared image can't
// adapt to whoever's looking at it later, so it needs one look that reads clearly
// wherever it ends up (Discord, Twitter, saved to camera roll).
const COLORS = {
  background: "#fafaf8",
  foreground: "#16150f",
  muted: "#6f6d64",
  border: "#e7e5df",
  won: "#059669",
  lost: "#6f6d64",
  barTrack: "#e7e5df",
  barFill: "#16150f",
};

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function drawCard(params: {
  scenario: string;
  finalNarrative: string;
  statLabel: string;
  statValue: number;
  won: boolean;
}): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const padding = 72;

  // Logo mark, top-left
  try {
    const logo = await loadImage("/logo.png");
    ctx.drawImage(logo, padding, 64, 40, 40);
  } catch {
    // Non-fatal if the logo can't load for some reason - the rest of the card still works.
  }
  ctx.fillStyle = COLORS.muted;
  ctx.font = "600 20px Arial, sans-serif";
  ctx.fillText("BLUTO BOX", padding + 52, 91);

  // Win/lose badge, top-right
  const badgeText = params.won ? "STORY WON" : "STORY ENDED";
  ctx.font = "700 18px Arial, sans-serif";
  const badgeWidth = ctx.measureText(badgeText).width + 40;
  const badgeColor = params.won ? COLORS.won : COLORS.lost;
  ctx.fillStyle = badgeColor;
  ctx.globalAlpha = 0.12;
  roundRect(ctx, WIDTH - padding - badgeWidth, 66, badgeWidth, 38, 19);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = badgeColor;
  ctx.fillText(badgeText, WIDTH - padding - badgeWidth + 20, 91);

  // Scenario as the headline
  ctx.fillStyle = COLORS.foreground;
  ctx.font = "700 40px Arial, sans-serif";
  const titleLines = wrapText(ctx, params.scenario, WIDTH - padding * 2).slice(0, 3);
  let y = 190;
  for (const line of titleLines) {
    ctx.fillText(line, padding, y);
    y += 50;
  }

  // Final narrative excerpt
  y += 16;
  ctx.fillStyle = COLORS.muted;
  ctx.font = "400 24px Arial, sans-serif";
  const bodyLines = wrapText(ctx, params.finalNarrative, WIDTH - padding * 2).slice(0, 4);
  for (const line of bodyLines) {
    ctx.fillText(line, padding, y);
    y += 34;
  }

  // Stat meter, bottom section
  const barY = HEIGHT - 150;
  ctx.fillStyle = COLORS.foreground;
  ctx.font = "600 20px Arial, sans-serif";
  ctx.fillText(`${params.statLabel}`, padding, barY - 14);
  ctx.fillStyle = COLORS.muted;
  ctx.font = "400 20px Arial, sans-serif";
  ctx.fillText(`${params.statValue}/100`, WIDTH - padding - 70, barY - 14);

  ctx.fillStyle = COLORS.barTrack;
  roundRect(ctx, padding, barY, WIDTH - padding * 2, 12, 6);
  ctx.fill();
  ctx.fillStyle = params.won ? COLORS.won : COLORS.barFill;
  const fillWidth = Math.max(12, ((WIDTH - padding * 2) * params.statValue) / 100);
  roundRect(ctx, padding, barY, fillWidth, 12, 6);
  ctx.fill();

  // Call to action, bottom
  ctx.fillStyle = COLORS.muted;
  ctx.font = "400 20px Arial, sans-serif";
  ctx.fillText("Play a free AI text adventure at blutobox.com/adventure", padding, HEIGHT - 56);

  return canvas;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function ShareEndingCard(props: {
  scenario: string;
  finalNarrative: string;
  statLabel: string;
  statValue: number;
  won: boolean;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  async function handleGenerate() {
    setError(null);
    setGenerating(true);
    try {
      const canvas = await drawCard(props);
      setPreview(canvas.toDataURL("image/png"));
    } catch {
      setError("Couldn't generate the image");
    } finally {
      setGenerating(false);
    }
  }

  if (preview) {
    return (
      <div className="space-y-2 rounded-2xl border border-border bg-surface p-4">
        <img src={preview} alt="Shareable ending card" className="w-full rounded-lg border border-border" />
        <div className="flex gap-2">
          <a
            href={preview}
            download="bluto-box-adventure-ending.png"
            className="rounded-full bg-accent px-4 py-2 text-xs font-medium text-accent-foreground transition-opacity hover:opacity-85"
          >
            Download image
          </a>
          <button onClick={() => setPreview(null)} className="text-xs text-muted underline underline-offset-2 hover:text-foreground">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleGenerate}
        disabled={generating}
        className="rounded-full border border-border px-4 py-2 text-xs font-medium transition-colors hover:bg-surface disabled:opacity-50"
      >
        {generating ? "Generating…" : "Share this ending"}
      </button>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
