"use client";

import { useRouter } from "next/navigation";
import { setPendingUpload } from "@/lib/pending-upload";

export function UploadToBlutoButton({ blob, filename }: { blob: Blob; filename: string }) {
  const router = useRouter();

  function handleClick() {
    const type = blob.type || "application/octet-stream";
    const file = blob instanceof File ? blob : new File([blob], filename, { type });
    setPendingUpload(file);
    router.push("/upload");
  }

  return (
    <button
      onClick={handleClick}
      className="w-full rounded-full border border-border py-2.5 text-sm font-medium transition-colors hover:bg-background"
    >
      Upload &amp; share this on Bluto Box
    </button>
  );
}
