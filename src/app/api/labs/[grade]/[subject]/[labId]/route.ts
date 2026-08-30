import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ grade: string; subject: string; labId: string }> }
) {
  try {
    const params = await props.params;
    const session = getSessionUser(req);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    // Retrieve full user profile with role and student relation
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { student: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Extract target grade digit from parameter string (e.g. "grade10" or "10")
    const gradeMatch = params.grade.match(/\d+/);
    if (!gradeMatch) {
      return NextResponse.json({ error: 'Invalid grade format in URL' }, { status: 400 });
    }
    const targetGrade = parseInt(gradeMatch[0], 10);

    // Enforce authorization for student accounts
    if (user.role === 'STUDENT') {
      const studentGrade = user.student?.grade;
      if (!studentGrade) {
        return NextResponse.json(
          { error: 'Student record or grade not found.' },
          { status: 403 }
        );
      }

      // If the student's grade is lower than the target lab grade, deny access
      if (studentGrade < targetGrade) {
        return NextResponse.json(
          {
            error: 'Grade Locked: This lab belongs to a higher grade level.',
            studentGrade,
            targetGrade,
            locked: true
          },
          { status: 403 }
        );
      }
    }

    // Retrieve lab configuration from database
    const lab = await prisma.virtualLab.findUnique({
      where: { labId: params.labId }
    });

    if (!lab || !lab.enabled) {
      return NextResponse.json({ error: 'Virtual Lab not found' }, { status: 404 });
    }

    // Fetch existing student progress if available
    let progress = null;
    if (user.student) {
      progress = await prisma.labProgress.findUnique({
        where: {
          studentId_labId: {
            studentId: user.student.id,
            labId: lab.labId
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      lab: {
        labId: lab.labId,
        grade: lab.grade,
        subject: lab.subject,
        chapterId: lab.chapterId,
        lessonId: lab.lessonId,
        title: lab.title,
        description: lab.description,
        learningObjectives: lab.learningObjectives ? JSON.parse(lab.learningObjectives) : [],
        labType: lab.labType,
        assets: lab.assets ? JSON.parse(lab.assets) : null,
        configuration: lab.configuration ? JSON.parse(lab.configuration) : null,
        equations: lab.equations ? JSON.parse(lab.equations) : null,
        questions: lab.questions ? JSON.parse(lab.questions) : [],
        localization: lab.localization ? JSON.parse(lab.localization) : null
      },
      progress: progress ? {
        startedAt: progress.startedAt,
        completedAt: progress.completedAt,
        attempts: progress.attempts,
        score: progress.score,
        timeSpent: progress.timeSpent,
        experimentResults: progress.experimentResults ? JSON.parse(progress.experimentResults) : null
      } : null
    });
  } catch (error: any) {
    console.error('Fetch lab config error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
