import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: Request) {
  try {
    const { domain, difficulty } = await req.json();

    if (!domain || !difficulty) {
      return NextResponse.json(
        { error: 'Domain and difficulty are required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = `Generate a ${difficulty} roadmap for learning ${domain}. Include essential topics, skills, and tools. Format the response in clear sections with bullet points.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return NextResponse.json({ 
      roadmap: response.text(),
      status: 'success'
    });
  } catch (error) {
    console.error('Roadmap generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate roadmap' },
      { status: 500 }
    );
  }
}
