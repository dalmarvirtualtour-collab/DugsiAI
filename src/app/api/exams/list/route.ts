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

    const { checkUserQuota } = await import('@/lib/quota');
    const quotaResult = await checkUserQuota(session.userId, 'exam');
    if (!quotaResult.allowed) {
      return NextResponse.json(
        {
          error: quotaResult.reason || "403 Limit Exhausted: Daily limit exceeded.",
          limitExhausted: true,
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const gradeParam = searchParams.get('grade');

    let whereClause = {};
    if (gradeParam) {
      const grade = parseInt(gradeParam, 10);
      if (!isNaN(grade)) {
        whereClause = { grade };
      }
    }

    const exams = await prisma.mockExam.findMany({
      where: whereClause,
      orderBy: { title: 'asc' },
    });

    // Parse the question lists
    const formattedExams = exams.map((exam) => {
      let qList = [];
      try {
        qList = JSON.parse(exam.questionsList);
      } catch (e) {
        qList = [];
      }
      return {
        id: exam.id,
        title: exam.title,
        grade: exam.grade,
        subjectId: exam.subjectId,
        durationMinutes: exam.durationMinutes,
        questionCount: qList.length,
      };
    });

    return NextResponse.json({ success: true, exams: formattedExams });
  } catch (error: any) {
    console.error('Exam list error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
