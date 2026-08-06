function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
}

export async function svgToPngDataUrl(svgString: string, size: number, logoDataUrl?: string): Promise<string> {
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  let qrImg: HTMLImageElement;
  try {
    qrImg = await loadImageFromUrl(url);
  } catch {
    URL.revokeObjectURL(url);
    throw new Error("Failed to rasterize QR code");
  }
  URL.revokeObjectURL(url);

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);
  ctx.drawImage(qrImg, 0, 0, size, size);

  if (logoDataUrl) {
    const logoImg = await loadImageFromUrl(logoDataUrl).catch(() => null);
    if (logoImg) {
      const logoSize = size * 0.22;
      const pad = logoSize * 0.15;
      const x = (size - logoSize) / 2;
      const y = (size - logoSize) / 2;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x - pad, y - pad, logoSize + pad * 2, logoSize + pad * 2);
      ctx.drawImage(logoImg, x, y, logoSize, logoSize);
    }
  }

  return canvas.toDataURL("image/png");
}
