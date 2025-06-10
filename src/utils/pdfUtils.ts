import * as pdfjsLib from 'pdfjs-dist';

export async function initializePdfJs() {
  try {
    if (typeof window === 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    }
  } catch (error) {
    console.error('PDF.js worker initialization error:', error);
    throw new Error('Failed to initialize PDF.js worker');
  }
}

export async function extractTextFromPdf(fileBuffer: ArrayBuffer): Promise<string> {
  try {
    await initializePdfJs();
    
    const loadingTask = pdfjsLib.getDocument({
      data: fileBuffer,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true
    });

    const pdf = await loadingTask.promise;
    let text = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(' ') + '\n';
    }

    return text;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF');
  }
}
