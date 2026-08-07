// Removes EXIF/metadata (GPS location, camera model, timestamp, etc.) from photos
// before upload by round-tripping through a canvas - canvas only ever carries pixel
// data, so re-exporting from it inherently drops every metadata segment, without
// needing an EXIF-parsing library. Runs entirely in the browser: the metadata never
// leaves the uploader's device in the first place, not even transiently to our server.
//
// Deliberately excludes GIF (canvas.toBlob would only capture a single frame, destroying
// animation) and SVG (not a metadata-bearing raster format, rasterizing it would be
// destructive and pointless). Any failure falls back to the original, untouched file -
// this should never be the reason an upload fails.
const STRIPPABLE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function stripImageMetadata(file: File): Promise<File> {
  if (!STRIPPABLE_TYPES.has(file.type)) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, file.type, 0.95)
    );
    if (!blob) return file;

    return new File([blob], file.name, { type: file.type, lastModified: file.lastModified });
  } catch {
    return file;
  }
}
