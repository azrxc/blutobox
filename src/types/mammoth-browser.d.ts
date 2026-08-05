declare module "mammoth/mammoth.browser.js" {
  interface ConvertResult {
    value: string;
    messages: Array<{ type: "warning" | "error"; message: string }>;
  }
  interface ConvertOptions {
    convertImage?: unknown;
  }
  interface ImageInput {
    contentType: string;
    readAsBase64String: () => Promise<string>;
  }
  interface MammothBrowser {
    convertToHtml: (input: { arrayBuffer: ArrayBuffer }, options?: ConvertOptions) => Promise<ConvertResult>;
    images: {
      imgElement: (f: (image: ImageInput) => Promise<{ src: string }>) => unknown;
    };
  }
  const mammoth: MammothBrowser;
  export default mammoth;
}
