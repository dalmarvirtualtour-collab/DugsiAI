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

    const parentUser = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        parent: {
          include: {
            students: {
              include: {
                user: {
                  include: {
                    subscription: true,
                    usageLogs: true,
                  },
                },
                school: true,
                quizAttempts: {
                  orderBy: { createdAt: 'desc' },
                },
                examAttempts: {
                  orderBy: { createdAt: 'desc' },
                },
              },
            },
          },
        },
      },
    });

    if (!parentUser || !parentUser.parent) {
      return NextResponse.json(
        { error: 'Forbidden. Parent dashboard is restricted to parent profiles.' },
        { status: 403 }
      );
    }

    const studentsProgress = [];

    for (const student of parentUser.parent.students) {
      const studentUser = student.user;

      // Calculate stats
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

      // Daily AI usage
      const todayStr = new Date().toISOString().split('T')[0];
      const todayUsage = studentUser.usageLogs.find((u) => u.date === todayStr);
      const aiMessagesToday = todayUsage ? todayUsage.messageCount : 0;

      // Simulated study time in minutes (based on quiz attempts + exam attempts + 10 mins per AI usage)
      const studyTimeMinutes = totalQuizzes * 15 + totalExams * 60 + aiMessagesToday * 3;

      studentsProgress.push({
        id: student.id,
        name: studentUser.name,
        phone: studentUser.phone,
        grade: student.grade,
        schoolName: student.school?.name || 'Self-Study',
        subscription: {
          plan: studentUser.subscription?.plan || 'FREEMIUM',
          status: studentUser.subscription?.status || 'ACTIVE',
        },
        stats: {
          totalQuizzes,
          avgQuizScore,
          totalExams,
          avgExamScore,
          studyTimeMinutes,
          aiMessagesToday,
        },
        quizHistory: student.quizAttempts.slice(0, 5).map(q => ({
          id: q.id,
          score: q.score,
          totalQuestions: q.totalQuestions,
          createdAt: q.createdAt,
        })),
        examHistory: student.examAttempts.slice(0, 5).map(e => ({
          id: e.id,
          score: e.score,
          totalQuestions: e.totalQuestions,
          createdAt: e.createdAt,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      parentProfile: {
        name: parentUser.name,
        phone: parentUser.phone,
      },
      students: studentsProgress,
    });
  } catch (error: any) {
    console.error('Parent dashboard query error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
