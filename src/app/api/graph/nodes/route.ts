import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get('subject');
    
    let fastapiUrl = `http://127.0.0.1:8000/api/v1/graph/nodes`;
    if (subject) {
      fastapiUrl += `?subject=${encodeURIComponent(subject)}`;
    }
    
    const response = await fetch(fastapiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 0 }
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
    console.error('Next.js API Graph Nodes Proxy Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error in Proxy', details: error.message },
      { status: 500 }
    );
  }
}
