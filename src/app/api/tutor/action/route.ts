import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Call the uvicorn FastAPI proxy server
    const fastapiUrl = 'http://127.0.0.1:8000/api/v1/tutor/action';
    
    const response = await fetch(fastapiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'FastAPI Backend Error', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Next.js API Tutor Action Proxy Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error in Proxy', details: error.message },
      { status: 500 }
    );
  }
}
