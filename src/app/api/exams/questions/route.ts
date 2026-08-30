import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionUser(req);
    const isDev = process.env.NODE_ENV !== 'production';
    const bypassAuth = req.nextUrl.searchParams.get('bypassAuth') === 'true' && isDev;

    if (!session && !bypassAuth) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const examId = searchParams.get('examId');

    if (!examId) {
      return NextResponse.json({ error: 'Missing examId parameter' }, { status: 400 });
    }

    const exam = await prisma.mockExam.findUnique({
      where: { id: examId }
    });

    if (!exam) {
      return NextResponse.json({ error: 'Mock exam not found' }, { status: 404 });
    }

    let qIds: string[] = [];
    try {
      qIds = JSON.parse(exam.questionsList);
    } catch (e) {
      qIds = [];
    }

    if (qIds.length === 0) {
      return NextResponse.json({ success: true, questions: [] });
    }

    const questions = await prisma.question.findMany({
      where: {
        id: { in: qIds }
      }
    });

    // Keep questions in original order
    const sortedQuestions = qIds
      .map(id => questions.find(q => q.id === id))
      .filter((q): q is typeof questions[0] => !!q);

    const formattedQuestions = sortedQuestions.map((q: any) => {
      let optionsList = [];
      try {
        optionsList = JSON.parse(q.options);
      } catch (e) {
        optionsList = typeof q.options === 'string' ? q.options.split(',') : [];
      }
      return {
        id: q.id,
        type: q.type,
        text: q.text,
        options: optionsList,
        explanation: q.explanation
      };
    });

    return NextResponse.json({ success: true, questions: formattedQuestions });

  } catch (error: any) {
    console.error('Fetch exam questions error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
