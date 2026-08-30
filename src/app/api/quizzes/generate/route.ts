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

    const { searchParams } = new URL(req.url);
    const chapterId = searchParams.get('chapterId');

    if (!chapterId) {
      return NextResponse.json({ error: 'Chapter ID is required' }, { status: 400 });
    }

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        subject: true,
      },
    });

    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    // Enforce paywall for chapters 3+ for Freemium users
    if (chapter.chapterNumber > 2) {
      const sub = await prisma.subscription.findUnique({
        where: { userId: session.userId },
      });

      if (!sub || sub.plan === 'FREEMIUM' || sub.status !== 'ACTIVE') {
        return NextResponse.json(
          {
            error: 'This chapter quiz is locked. Upgrade your subscription to unlock all chapter quizzes.',
            locked: true,
          },
          { status: 403 }
        );
      }
    }

    const questions = await prisma.question.findMany({
      where: { chapterId },
      orderBy: { id: 'asc' },
    });

    // Strip correct answers to prevent inspection
    const sanitizedQuestions = questions.map((q) => {
      let optionsArray = [];
      try {
        optionsArray = JSON.parse(q.options);
      } catch (e) {
        optionsArray = [];
      }
      return {
        id: q.id,
        type: q.type,
        text: q.text,
        options: optionsArray,
        difficulty: q.difficulty,
      };
    });

    return NextResponse.json({
      success: true,
      chapter: {
        id: chapter.id,
        name: chapter.name,
        chapterNumber: chapter.chapterNumber,
        subjectName: chapter.subject.name,
      },
      questions: sanitizedQuestions,
    });
  } catch (error: any) {
    console.error('Quiz generation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
