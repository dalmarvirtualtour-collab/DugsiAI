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
    const gradeParam = searchParams.get('grade');
    const subjectId = searchParams.get('subjectId');

    if (subjectId) {
      const chapters = await prisma.chapter.findMany({
        where: { subjectId },
        orderBy: { chapterNumber: 'asc' },
        include: {
          lessons: {
            select: {
              id: true,
              title: true,
              lessonNumber: true,
              textbookAccess: true,
            },
            orderBy: { lessonNumber: 'asc' },
          },
        },
      });
      return NextResponse.json({ success: true, chapters });
    }

    if (gradeParam) {
      const grade = parseInt(gradeParam, 10);
      if (isNaN(grade)) {
        return NextResponse.json({ error: 'Invalid grade parameter' }, { status: 400 });
      }

      const subjects = await prisma.subject.findMany({
        where: { grade },
        include: {
          _count: {
            select: { chapters: true },
          },
        },
      });
      return NextResponse.json({ success: true, subjects });
    }

    // Default: fetch everything grouped by grade
    const subjects = await prisma.subject.findMany({
      orderBy: [{ grade: 'asc' }, { name: 'asc' }],
    });
    return NextResponse.json({ success: true, subjects });
  } catch (error: any) {
    console.error('Curriculum query error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
