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

    const studentUser = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        student: {
          include: {
            school: true,
            quizAttempts: {
              orderBy: { createdAt: 'desc' },
            },
            examAttempts: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        notifications: {
          where: { read: false },
          orderBy: { createdAt: 'desc' },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!studentUser || !studentUser.student) {
      return NextResponse.json(
        { error: 'Forbidden. Student dashboard is restricted to student profiles.' },
        { status: 403 }
      );
    }

    const student = studentUser.student;

    // Calculate averages
    const totalQuizzes = student.quizAttempts.length;
    const avgQuizScore =
      totalQuizzes > 0
        ? Math.round(
            (student.quizAttempts.reduce((sum, qa) => sum + (qa.score / qa.totalQuestions), 0) /
              totalQuizzes) *
              100
          )
        : 0;

    const totalExams = student.examAttempts.length;
    const avgExamScore =
      totalExams > 0
        ? Math.round(
            (student.examAttempts.reduce((sum, ea) => sum + (ea.score / ea.totalQuestions), 0) /
              totalExams) *
              100
          )
        : 0;

    // Check active days for study streak
    const uniqueDays = new Set(
      student.quizAttempts.map((qa) => qa.createdAt.toISOString().split('T')[0])
    );
    const studyStreak = uniqueDays.size;

    // Gamified badges based on performance
    const badges = [];
    if (studyStreak >= 3) {
      badges.push({ name: '🔥 Study Streak', desc: 'Studied multiple days in a row' });
    }
    if (totalQuizzes >= 1) {
      badges.push({ name: '🧪 Explorer', desc: 'Completed first chapter quiz' });
    }
    if (avgQuizScore >= 80 && totalQuizzes >= 2) {
      badges.push({ name: '🏆 Scholar', desc: 'Maintained 80%+ quiz score' });
    }
    if (totalExams >= 1) {
      badges.push({ name: '🎓 Matric Ready', desc: 'Completed first mock exam' });
    }

    // Unlocked badges fallback to keep UI rich
    if (badges.length === 0) {
      badges.push({ name: '🌱 Fresh Start', desc: 'Registered your DugsiAI account' });
    }

    // Custom learning recommendations based on weak subjects/quizzes (<75%)
    const recommendations = [];
    const weakAttempts = student.quizAttempts.filter((qa) => (qa.score / qa.totalQuestions) < 0.75);
    
    for (const qa of weakAttempts.slice(0, 3)) {
      const chapter = await prisma.chapter.findUnique({
        where: { id: qa.chapterId },
        include: { subject: true },
      });
      if (chapter) {
        recommendations.push({
          id: chapter.id,
          chapterName: chapter.name,
          subjectName: chapter.subject.name,
          scorePct: Math.round((qa.score / qa.totalQuestions) * 100),
          action: 'Quiz Review',
          message: `Focus on ${chapter.subject.name} Unit ${chapter.chapterNumber}: ${chapter.name} (${Math.round((qa.score / qa.totalQuestions) * 100)}%). Review its notes and re-attempt the quiz.`,
        });
      }
    }

    // Default recommendation if none
    if (recommendations.length === 0) {
      recommendations.push({
        id: 'general-study',
        chapterName: 'Kinematics or Collision Theory',
        subjectName: 'STEM Core',
        scorePct: 100,
        action: 'Introduction',
        message: 'No weak areas flagged! Keep studying textbook chapters and take unit quizzes to measure your knowledge.',
      });
    }

    return NextResponse.json({
      success: true,
      profile: {
        name: studentUser.name,
        grade: student.grade,
        schoolName: student.school?.name || 'Self-Study / Other',
        region: studentUser.region,
        phone: studentUser.phone,
      },
      stats: {
        studyStreak,
        totalQuizzes,
        avgQuizScore,
        totalExams,
        avgExamScore,
        badges,
      },
      recommendations,
      notifications: studentUser.notifications,
      payments: studentUser.payments,
    });
  } catch (error: any) {
    console.error('Student dashboard query error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
