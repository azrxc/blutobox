// In-memory handoff for "upload this result to Bluto Box" buttons across the file
// converter/QR tools. Client-side navigation doesn't reload the JS runtime, so a
// plain module variable survives the router.push() to /upload. Not persisted
// anywhere - a hard refresh loses it, which is fine, it's just a convenience handoff.
let pendingFile: File | null = null;

export function setPendingUpload(file: File) {
  pendingFile = file;
}

export function takePendingUpload(): File | null {
  const file = pendingFile;
  pendingFile = null;
  return file;
}
