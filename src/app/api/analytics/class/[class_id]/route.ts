import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ class_id: string }> }
) {
  try {
    const { class_id } = await props.params;
    const fastapiUrl = `http://127.0.0.1:8000/api/v1/analytics/class/${class_id}`;
    
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
    console.error('Next.js API Class Summary Proxy Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error in Proxy', details: error.message },
      { status: 500 }
    );
  }
}
