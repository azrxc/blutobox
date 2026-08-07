"use client";

import dynamic from "next/dynamic";

// next/dynamic's ssr:false only works from within a Client Component - the individual
// tool page.tsx files are Server Components (they export `metadata`), so the dynamic()
// calls live here instead and the pages just import the result.
export const DocToPdfConverter = dynamic(() => import("./doc-to-pdf-converter").then((m) => m.DocToPdfConverter), { ssr: false });
export const ImageCompressor = dynamic(() => import("./image-compressor").then((m) => m.ImageCompressor), { ssr: false });
export const VideoToGifConverter = dynamic(() => import("./video-to-gif-converter").then((m) => m.VideoToGifConverter), { ssr: false });
export const PdfMergeConverter = dynamic(() => import("./pdf-merge-converter").then((m) => m.PdfMergeConverter), { ssr: false });
export const PdfToImagesConverter = dynamic(() => import("./pdf-to-images-converter").then((m) => m.PdfToImagesConverter), { ssr: false });
export const ImageFormatConverter = dynamic(() => import("./image-format-converter").then((m) => m.ImageFormatConverter), { ssr: false });
