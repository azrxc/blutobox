"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { UploadToBlutoButton } from "./upload-to-bluto-button";
import { ProBadge } from "../pro-badge";

const FREE_MAX_DURATION_SECONDS = 10;
const PRO_MAX_DURATION_SECONDS = 60;
const FREE_MAX_FPS = 20;
const PRO_MAX_FPS = 30;

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function loadVideo(file: File): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    const url = URL.createObjectURL(file);
    video.onloadedmetadata = () => resolve(video);
    video.onerror = () => reject(new Error("Couldn't load this video"));
    video.src = url;
  });
}

function seekTo(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve) => {
    video.onseeked = () => resolve();
    video.currentTime = time;
  });
}

async function convertToGif(
  file: File,
  fps: number,
  durationSeconds: number,
  maxWidth: number,
  onProgress: (done: number, total: number) => void
): Promise<Blob> {
  const { GIFEncoder, quantize, applyPalette } = await import("gifenc");
  const video = await loadVideo(file);
  const clipLength = Math.min(durationSeconds, video.duration || durationSeconds);
  const scale = Math.min(1, maxWidth / (video.videoWidth || maxWidth));
  const width = Math.round((video.videoWidth || maxWidth) * scale);
  const height = Math.round((video.videoHeight || maxWidth) * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported in this browser");

  const frameCount = Math.max(1, Math.round(clipLength * fps));
  const delay = Math.round(1000 / fps);
  const gif = GIFEncoder();
  let globalPalette: ReturnType<typeof quantize> | null = null;

  for (let i = 0; i < frameCount; i++) {
    await seekTo(video, (i / frameCount) * clipLength);
    ctx.drawImage(video, 0, 0, width, height);
    const { data } = ctx.getImageData(0, 0, width, height);
    if (!globalPalette) globalPalette = quantize(data, 256);
    const index = applyPalette(data, globalPalette);
    gif.writeFrame(index, width, height, { palette: globalPalette, delay });
    onProgress(i + 1, frameCount);
  }

  gif.finish();
  URL.revokeObjectURL(video.src);
  return new Blob([new Uint8Array(gif.bytes())], { type: "image/gif" });
}

function renameExt(filename: string) {
  const dot = filename.lastIndexOf(".");
  const base = dot > 0 ? filename.slice(0, dot) : filename;
  return `${base}.gif`;
}

export function VideoToGifConverter() {
  const { data: session } = useSession();
  const isPro = session?.user?.planTier === "PRO";
  const maxDuration = isPro ? PRO_MAX_DURATION_SECONDS : FREE_MAX_DURATION_SECONDS;
  const maxFps = isPro ? PRO_MAX_FPS : FREE_MAX_FPS;

  const [file, setFile] = useState<File | null>(null);
  const [fps, setFps] = useState(10);
  const [duration, setDuration] = useState(4);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Blob | null>(null);

  async function handleConvert() {
    if (!file) return;
    setConverting(true);
    setError(null);
    setProgress({ done: 0, total: 0 });
    setResult(null);
    try {
      const blob = await convertToGif(
        file,
        Math.min(fps, maxFps),
        Math.min(duration, maxDuration),
        480,
        (done, total) => setProgress({ done, total })
      );
      downloadBlob(blob, renameExt(file.name));
      setResult(blob);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed");
    } finally {
      setConverting(false);
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-surface p-5">
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background px-6 py-8 text-center transition-colors hover:border-foreground/30">
        <span className="text-sm font-medium">{file ? file.name : "Choose a video"}</span>
        <span className="text-xs text-muted">{file ? "Click to change" : "or drag and drop"}</span>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="hidden"
        />
      </label>

      <p className="text-xs text-muted">
        Converts the first {duration}s of the video, entirely in your browser. Longer or higher-FPS conversions
        take more time and memory, keep clips short for the best result.
      </p>

      <div className="space-y-1.5">
        <label className="flex justify-between text-xs text-muted" htmlFor="duration">
          <span>Length to convert</span>
          <span>{duration}s</span>
        </label>
        <input
          id="duration"
          type="range"
          min={1}
          max={maxDuration}
          step={1}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="w-full"
        />
        {!isPro && (
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <ProBadge /> up to {PRO_MAX_DURATION_SECONDS}s at {PRO_MAX_FPS}fps.{" "}
            <Link href="/pricing" className="underline underline-offset-2">
              Upgrade
            </Link>
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="flex justify-between text-xs text-muted" htmlFor="fps">
          <span>Frame rate</span>
          <span>{fps} fps</span>
        </label>
        <input
          id="fps"
          type="range"
          min={5}
          max={maxFps}
          step={1}
          value={fps}
          onChange={(e) => setFps(Number(e.target.value))}
          className="w-full"
        />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        onClick={handleConvert}
        disabled={!file || converting}
        className="w-full rounded-full bg-accent py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-85 disabled:opacity-40"
      >
        {converting
          ? progress.total > 0
            ? `Converting… frame ${progress.done}/${progress.total}`
            : "Loading video…"
          : "Convert & download"}
      </button>
      {result && <UploadToBlutoButton blob={result} filename={file ? renameExt(file.name) : "video.gif"} />}
    </div>
  );
}
