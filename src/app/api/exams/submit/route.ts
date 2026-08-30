import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
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

    const studentUser = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { student: true },
    });

    if (!studentUser || !studentUser.student) {
      return NextResponse.json(
        { error: 'Only registered students can attempt mock exams.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { examId, answers } = body; // answers = { [questionId]: "optionText" }

    if (!examId || !answers) {
      return NextResponse.json(
        { error: 'Exam ID and answers are required' },
        { status: 400 }
      );
    }

    const exam = await prisma.mockExam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      return NextResponse.json({ error: 'Mock Exam not found' }, { status: 404 });
    }

    let questionIds: string[] = [];
    try {
      questionIds = JSON.parse(exam.questionsList);
    } catch (e) {
      questionIds = [];
    }

    const questions = await prisma.question.findMany({
      where: {
        id: { in: questionIds },
      },
      include: {
        chapter: {
          include: {
            subject: true,
          },
        },
      },
    });

    let score = 0;
    const totalQuestions = questions.length;
    const feedbackList = [];
    
    // Group analysis: { [chapterId]: { correct: 0, total: 0, chapterName: "", subjectName: "" } }
    const chapterAnalysis: { [key: string]: { correct: number; total: number; name: string; subject: string } } = {};

    for (const q of questions) {
      const studentAnswer = answers[q.id] || null;
      const isCorrect = studentAnswer === q.correctAnswer;
      if (isCorrect) score++;

      // Initialize chapter grouping
      if (!chapterAnalysis[q.chapterId]) {
        chapterAnalysis[q.chapterId] = {
          correct: 0,
          total: 0,
          name: q.chapter.name,
          subject: q.chapter.subject.name,
        };
      }
      chapterAnalysis[q.chapterId].total++;
      if (isCorrect) {
        chapterAnalysis[q.chapterId].correct++;
      }

      let optionsArray = [];
      try {
        optionsArray = JSON.parse(q.options);
      } catch (e) {
        optionsArray = [];
      }

      feedbackList.push({
        id: q.id,
        text: q.text,
        options: optionsArray,
        studentAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
      });
    }

    // Compile learning recommendations for chapters where student scored below 70%
    const recommendations = [];
    for (const cid in chapterAnalysis) {
      const { correct, total, name, subject } = chapterAnalysis[cid];
      const pct = total > 0 ? (correct / total) * 100 : 0;
      if (pct < 70) {
        recommendations.push({
          chapterId: cid,
          chapterName: name,
          subjectName: subject,
          scorePct: Math.round(pct),
          message: `We noticed you struggled with ${subject} - Chapter: ${name} (score: ${Math.round(pct)}%). We highly recommend reviewing this unit's lessons and practicing its standalone chapter quiz.`,
        });
      }
    }

    // Save exam attempt in database
    const attempt = await prisma.examAttempt.create({
      data: {
        studentId: studentUser.student.id,
        examId,
        score,
        totalQuestions,
        answers: JSON.stringify(answers),
      },
    });

    // Create Notification
    await prisma.notification.create({
      data: {
        userId: session.userId,
        title: 'Mock Exam Scored!',
        content: `You completed "${exam.title}" with a score of ${score}/${totalQuestions} (${Math.round((score / totalQuestions) * 100)}%). Review your dashboard for custom chapter study recommendations.`,
      },
    });

    // Log activity
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'EXAM_SUBMIT',
        details: `Completed mock exam "${exam.title}" with score ${score}/${totalQuestions}`,
      },
    });

    return NextResponse.json({
      success: true,
      score,
      totalQuestions,
      attemptId: attempt.id,
      recommendations,
      feedback: feedbackList,
    });
  } catch (error: any) {
    console.error('Exam submission error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
