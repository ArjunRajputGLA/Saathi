declare module 'pdfjs-dist/legacy/build/pdf' {
  export * from 'pdfjs-dist/types/src/display/api';
}

declare module 'pdfjs-dist/legacy/build/pdf.worker.entry' {
  const worker: any;
  export default worker;
}

declare module 'pdfjs-dist/legacy/build/pdf.worker.mjs' {
    const worker: any;
    export default worker;
}

declare module 'pdfjs-dist' {
    export interface PDFDocumentProxy {
        numPages: number;
        getPage(pageNumber: number): Promise<PDFPageProxy>;
    }

    export interface PDFPageProxy {
        getTextContent(): Promise<PDFTextContent>;
    }

    export interface PDFTextContent {
        items: Array<{ str: string }>;
    }
}
