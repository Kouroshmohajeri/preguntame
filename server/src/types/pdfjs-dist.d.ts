declare module "pdfjs-dist/legacy/build/pdf.mjs" {
  export interface TextItem {
    str: string;
    dir: string;
    transform: number[];
    width: number;
    height: number;
  }

  export interface TextContent {
    items: TextItem[];
    styles: any;
  }

  export interface PDFPageProxy {
    getTextContent(): Promise<TextContent>;
  }

  export interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
  }

  export interface PDFDocumentLoadingTask {
    promise: Promise<PDFDocumentProxy>;
  }

  export function getDocument(src: {
    data: Uint8Array;
    useSystemFonts?: boolean;
  }): PDFDocumentLoadingTask;
}
