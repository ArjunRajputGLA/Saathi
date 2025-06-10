import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: Request) {
  try {
    const { text, numQuestions } = await req.json();
    
    if (!text) {
      return NextResponse.json({ error: 'No content provided' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Generate ${numQuestions} quiz questions based on the following content:
      ${text}
      Provide questions with four answer options (A, B, C, D). Also, include the correct answer.
      Format each question as follows:
      Question 1: [Your question here]
      A. [Option A]
      B. [Option B]
      C. [Option C]
      D. [Option D]
      **Answer:** [Correct Option]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return NextResponse.json({ questions: response.text() });
  } catch (error) {
    console.error('Quiz generation error:', error);
    return NextResponse.json({ error: 'Failed to generate quiz' }, { status: 500 });
  }
}
