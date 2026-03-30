type PdfParseModule = typeof import("pdf-parse");

let cachedPdfParseModule: PdfParseModule | null = null;

function ensurePdfJsPolyfills(): void {
  const runtime = globalThis as Record<string, unknown>;

  if (typeof runtime.DOMMatrix === "undefined") {
    class DOMMatrixPolyfill {
      a = 1;
      b = 0;
      c = 0;
      d = 1;
      e = 0;
      f = 0;

      multiplySelf() {
        return this;
      }

      preMultiplySelf() {
        return this;
      }

      translateSelf() {
        return this;
      }

      scaleSelf() {
        return this;
      }

      rotateSelf() {
        return this;
      }

      inverse() {
        return this;
      }
    }

    runtime.DOMMatrix = DOMMatrixPolyfill;
  }

  if (typeof runtime.ImageData === "undefined") {
    runtime.ImageData = class ImageDataPolyfill {
      constructor() {
        // No-op polyfill for server-side text extraction path.
      }
    };
  }

  if (typeof runtime.Path2D === "undefined") {
    runtime.Path2D = class Path2DPolyfill {
      constructor() {
        // No-op polyfill for server-side text extraction path.
      }
    };
  }
}

async function getPdfParseModule(): Promise<PdfParseModule> {
  if (cachedPdfParseModule) {
    return cachedPdfParseModule;
  }

  ensurePdfJsPolyfills();
  cachedPdfParseModule = await import("pdf-parse");
  return cachedPdfParseModule;
}

export async function extractPdfText(buffer: Buffer): Promise<string> {
  const { PDFParse } = await getPdfParseModule();
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
}
