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

    const studentUser = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { student: true },
    });

    if (!studentUser || !studentUser.student) {
      return NextResponse.json(
        { error: 'Only registered students can submit quizzes.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { chapterId, answers } = body; // answers = { [questionId]: "optionText" }

    if (!chapterId || !answers) {
      return NextResponse.json(
        { error: 'Chapter ID and answers are required' },
        { status: 400 }
      );
    }

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { subject: true },
    });

    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    const questions = await prisma.question.findMany({
      where: { chapterId },
    });

    let score = 0;
    const totalQuestions = questions.length;
    const feedbackList = [];

    for (const q of questions) {
      const studentAnswer = answers[q.id] || null;
      const isCorrect = studentAnswer === q.correctAnswer;
      if (isCorrect) score++;

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

    // Save the attempt in the database
    const attempt = await prisma.quizAttempt.create({
      data: {
        studentId: studentUser.student.id,
        chapterId,
        score,
        totalQuestions,
        answers: JSON.stringify(answers),
      },
    });

    // Create Notification
    await prisma.notification.create({
      data: {
        userId: session.userId,
        title: 'Quiz Completed!',
        content: `You scored ${score}/${totalQuestions} on the quiz for ${chapter.subject.name} - Chapter ${chapter.chapterNumber} (${chapter.name}).`,
      },
    });

    // Log activity
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'QUIZ_SUBMIT',
        details: `Submitted quiz for chapter ${chapter.name}, score ${score}/${totalQuestions}`,
      },
    });

    return NextResponse.json({
      success: true,
      score,
      totalQuestions,
      attemptId: attempt.id,
      feedback: feedbackList,
    });
  } catch (error: any) {
    console.error('Quiz submission error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
