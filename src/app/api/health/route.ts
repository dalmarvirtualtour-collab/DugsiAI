import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check database connectivity
    await prisma.user.count();
    
    return NextResponse.json({
      status: 'UP',
      database: 'CONNECTED',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Health check database connection failure:', error);
    return NextResponse.json(
      {
        status: 'DOWN',
        database: 'DISCONNECTED',
        error: error.message || 'Database query failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
