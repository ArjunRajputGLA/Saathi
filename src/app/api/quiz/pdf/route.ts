import { NextResponse } from 'next/server';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

// Node.js specific configuration
if (typeof window === 'undefined') {
  // Use CDN-hosted worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = '//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }

    // Process PDF
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await pdfjsLib.getDocument({
      data: arrayBuffer,
      useWorkerFetch: false,
      isEvalSupported: false,
      disableFontFace: true, // Add this to prevent font-related issues
    }).promise;

    let text = '';
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => item.str)
        .filter(Boolean)
        .join(' ');
      text += pageText + '\n';
    }

    if (!text.trim()) {
      return NextResponse.json({ error: 'No readable text found in PDF' }, { status: 400 });
    }

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error('PDF processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process PDF file. Please ensure the file is valid.' },
      { status: 500 }
    );
  }
}
