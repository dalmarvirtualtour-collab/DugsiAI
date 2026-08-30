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

    const teacherUser = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        teacher: {
          include: {
            school: true,
          },
        },
      },
    });

    if (!teacherUser || !teacherUser.teacher) {
      return NextResponse.json(
        { error: 'Forbidden. Teacher dashboard is restricted to teacher profiles.' },
        { status: 403 }
      );
    }

    const schoolId = teacherUser.teacher.schoolId;

    // Fetch students in this teacher's school
    const students = await prisma.student.findMany({
      where: { schoolId },
      include: {
        user: true,
        quizAttempts: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    const studentsProgress = students.map((student) => {
      const totalQuizzes = student.quizAttempts.length;
      const avgQuizScore =
        totalQuizzes > 0
          ? Math.round(
              (student.quizAttempts.reduce((sum, qa) => sum + (qa.score / qa.totalQuestions), 0) /
                totalQuizzes) *
                100
            )
          : 0;

      let status = 'In Progress';
      if (totalQuizzes === 0) {
        status = 'No Attempts';
      } else if (avgQuizScore >= 85) {
        status = 'Mastering';
      } else if (avgQuizScore < 60) {
        status = 'Need Intervention';
      }

      return {
        id: student.id,
        name: student.user.name,
        grade: student.grade,
        stats: {
          totalQuizzes,
          avgQuizScore,
          status,
        },
      };
    });

    return NextResponse.json({
      success: true,
      teacherProfile: {
        name: teacherUser.name,
        subject: teacherUser.teacher.subject,
        schoolName: teacherUser.teacher.school.name,
      },
      students: studentsProgress,
    });
  } catch (error: any) {
    console.error('Teacher dashboard query error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST endpoint for teachers to assign a lesson or quiz to all students in their school
export async function POST(req: NextRequest) {
  try {
    const session = getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teacherUser = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { teacher: true },
    });

    if (!teacherUser || !teacherUser.teacher) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { type, targetId, title, content } = await req.json(); // type = 'LESSON' | 'QUIZ'

    if (!type || !title || !content) {
      return NextResponse.json({ error: 'Type, title, and content are required' }, { status: 400 });
    }

    // Find all students in this school
    const students = await prisma.student.findMany({
      where: { schoolId: teacherUser.teacher.schoolId },
    });

    // Create a notification for each student
    const notificationsData = students.map((student) => ({
      userId: student.userId,
      title: `Assignment from Ustaad ${teacherUser.name}`,
      content: `Please study: "${title}". Instructions: ${content}`,
    }));

    if (notificationsData.length > 0) {
      await prisma.notification.createMany({
        data: notificationsData,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully assigned to ${students.length} students in your school.`,
    });
  } catch (error: any) {
    console.error('Teacher assignment error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
