import * as pdfjsLib from 'pdfjs-dist';

declare global {
    var pdfjsWorker: boolean;
}

export const initPdfWorker = async () => {
    if (!globalThis.pdfjsWorker) {
        const worker = await import('pdfjs-dist/build/pdf.worker.mjs');
        pdfjsLib.GlobalWorkerOptions.workerSrc = worker.default;
        globalThis.pdfjsWorker = true;
    }
};
