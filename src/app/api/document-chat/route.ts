import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    console.log('API Route called');
    
    // Check environment variable
    if (!process.env.GOOGLE_API_KEY) {
      console.error('GOOGLE_API_KEY not found');
      return NextResponse.json(
        { error: 'GOOGLE_API_KEY not configured' },
        { status: 500 }
      );
    }
    
    const { message, documentText } = await req.json();
    console.log('Request data:', { 
      hasMessage: !!message, 
      hasDocument: !!documentText,
      messageLength: message?.length,
      documentLength: documentText?.length
    });

    if (!message || !documentText) {
      return NextResponse.json(
        { error: 'Message and document text are required' },
        { status: 400 }
      );
    }

    // Now let's try the actual Google AI
    console.log('Initializing Google AI...');
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const prompt = `Context: ${documentText.substring(0, 15000)}

Question: ${message}

Instructions: 
1. Answer based only on the provided context
2. If the information isn't in the context, say "I cannot find this information in the document"
3. Keep responses concise and relevant

Answer:`;

    console.log('Sending request to Gemini...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log('Received response from Gemini');
    
    return NextResponse.json({ 
      response: response.text(),
      status: 'success'
    });
  } catch (error) {
    console.error('Full error:', error);
    return NextResponse.json(
      { error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}