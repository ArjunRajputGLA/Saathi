import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(req: Request) {
  try {
    const { url, numQuestions } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
    }

    // Fetch and extract text from URL
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    const text = $('body').text().replace(/\s+/g, ' ').trim();

    // Generate quiz
    const quizResponse = await fetch('/api/quiz/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, numQuestions })
    });

    const data = await quizResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('URL processing error:', error);
    return NextResponse.json({ error: 'Failed to process URL' }, { status: 500 });
  }
}
