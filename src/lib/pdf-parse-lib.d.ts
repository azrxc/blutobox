// @types/pdf-parse only declares the package's main entry ("pdf-parse"), but that
// entry has a bundler-breaking debug-mode side effect (see the comment in
// ai-summary.ts) - this project imports the internal implementation directly
// ("pdf-parse/lib/pdf-parse.js") instead, which has no bundled type declarations
// of its own. Shape mirrored from @types/pdf-parse's real declaration.
declare module "pdf-parse/lib/pdf-parse.js" {
  function PdfParse(dataBuffer: Buffer, options?: { max?: number }): Promise<{ text: string }>;
  export = PdfParse;
}
