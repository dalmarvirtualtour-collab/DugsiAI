import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getSessionUser(req);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login.' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        chapter: {
          include: {
            subject: true,
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    if (lesson.textbookAccess !== 'FREEMIUM') {
      const sub = await prisma.subscription.findUnique({
        where: { userId: session.userId },
      });

      if (!sub || sub.plan === 'FREEMIUM' || sub.status !== 'ACTIVE') {
        return NextResponse.json(
          {
            error: 'This premium lesson is locked. Upgrade your subscription to unlock full textbook access.',
            locked: true,
            requiredPlan: lesson.textbookAccess,
          },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ success: true, lesson });
  } catch (error: any) {
    console.error('Lesson query error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
