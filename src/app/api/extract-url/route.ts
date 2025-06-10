import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    
    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
    }

    // Validate URL format
    if (!url.match(/^https?:\/\/.+/)) {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Fetch the webpage content
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000, // 10 second timeout
    });

    // Parse HTML content
    const $ = cheerio.load(response.data);
    
    // Remove script and style elements
    $('script, style, nav, footer, header, aside, .advertisement, .ads').remove();
    
    // Extract text from paragraphs, headings, and list items
    let text = '';
    
    // Extract main content
    $('h1, h2, h3, h4, h5, h6, p, li, blockquote, article, section, div.content, div.main, main').each((_, element) => {
      const elementText = $(element).text().trim();
      if (elementText && elementText.length > 10) { // Filter out very short text
        text += elementText + '\n';
      }
    });

    // If no meaningful content found, try to extract all text
    if (text.length < 100) {
      text = $('body').text().replace(/\s+/g, ' ').trim();
    }

    // Clean up the text
    text = text
      .replace(/\n\s*\n/g, '\n') // Remove multiple newlines
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();

    if (!text || text.length < 50) {
      return NextResponse.json({ error: 'No meaningful content found on the webpage' }, { status: 400 });
    }

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error('Error processing URL:', error);
    
    if (error.code === 'ENOTFOUND') {
      return NextResponse.json({ error: 'Website not found or unreachable' }, { status: 400 });
    } else if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return NextResponse.json({ error: 'Request timeout - website took too long to respond' }, { status: 400 });
    } else if (error.response?.status === 403) {
      return NextResponse.json({ error: 'Access forbidden - website blocks automated requests' }, { status: 400 });
    } else if (error.response?.status === 404) {
      return NextResponse.json({ error: 'Page not found' }, { status: 400 });
    } else {
      return NextResponse.json({ error: 'Failed to fetch content from URL' }, { status: 500 });
    }
  }
}