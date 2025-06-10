import { promisify } from 'util';
import * as JSZip from 'jszip';
import { parseString } from 'xml2js';

export async function extractTextFromPPTX(buffer: Buffer): Promise<string> {
  try {
    const zip = new JSZip();
    const contents = await zip.loadAsync(buffer);
    
    // Get all slide XMLs
    const slideFiles = Object.keys(contents.files).filter(
      (fileName) => fileName.startsWith('ppt/slides/slide')
    );
    
    const texts: string[] = [];
    
    // Process each slide
    for (const slideFile of slideFiles) {
      const slideXML = await contents.file(slideFile)?.async('text');
      if (slideXML) {
        const parseXML = promisify(parseString);
        const result = await parseXML(slideXML);
        
        // Extract text from slide
        const slideTexts = extractTextFromSlide(result);
        if (slideTexts.length) {
          texts.push(`Slide ${texts.length + 1}:\n${slideTexts.join('\n')}`);
        }
      }
    }
    
    return texts.join('\n\n');
  } catch (error) {
    console.error('PPTX extraction error:', error);
    throw new Error('Failed to extract text from PPTX');
  }
}

function extractTextFromSlide(slideData: any): string[] {
  const texts: string[] = [];
  
  function traverse(obj: any) {
    if (!obj) return;
    
    if (typeof obj === 'object') {
      if (obj['a:t']) {
        const text = obj['a:t'];
        if (Array.isArray(text)) {
          texts.push(...text.filter(t => typeof t === 'string' && t.trim()));
        } else if (typeof text === 'string' && text.trim()) {
          texts.push(text.trim());
        }
      }
      
      Object.values(obj).forEach(val => traverse(val));
    }
  }
  
  traverse(slideData);
  return texts;
}
