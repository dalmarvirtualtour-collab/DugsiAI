import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const student_id = "student_demo"; // Default student_id for workspace simulation
    const fastapiUrl = `http://127.0.0.1:8000/api/v1/analytics/summary/${student_id}`;
    
    const response = await fetch(fastapiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
    console.error('Next.js API Analytics Summary Proxy Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error in Proxy', details: error.message },
      { status: 500 }
    );
  }
}
