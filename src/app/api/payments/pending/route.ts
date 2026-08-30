import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionUser(req);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login.' },
        { status: 401 }
      );
    }

    if (session.role !== 'SUPER_ADMIN' && !session.role.toLowerCase().includes('admin')) {
      return NextResponse.json(
        { error: 'Forbidden. Access restricted to administrators.' },
        { status: 403 }
      );
    }

    const pendingPayments = await prisma.payment.findMany({
      where: { status: 'PENDING' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            region: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, payments: pendingPayments });
  } catch (error: any) {
    console.error('Pending payments query error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
