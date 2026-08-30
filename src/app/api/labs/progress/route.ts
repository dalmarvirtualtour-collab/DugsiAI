import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { student: true }
    });

    if (!user || !user.student) {
      return NextResponse.json({ error: 'Only student accounts can save lab progress.' }, { status: 403 });
    }

    const body = await req.json();
    const { labId, completed, score, timeSpent, experimentResults } = body;

    if (!labId) {
      return NextResponse.json({ error: 'labId is required' }, { status: 400 });
    }

    // Retrieve the lab to verify grade authorization
    const lab = await prisma.virtualLab.findUnique({
      where: { labId }
    });

    if (!lab) {
      return NextResponse.json({ error: 'Virtual Lab not found' }, { status: 404 });
    }

    // Enforce authorization grade limit on write
    if (user.role === 'STUDENT' && user.student.grade < lab.grade) {
      return NextResponse.json({ error: 'Access Denied: Grade level mismatch.' }, { status: 403 });
    }

    const existingProgress = await prisma.labProgress.findUnique({
      where: {
        studentId_labId: {
          studentId: user.student.id,
          labId
        }
      }
    });

    const now = new Date();
    const updatedProgress = await prisma.labProgress.upsert({
      where: {
        studentId_labId: {
          studentId: user.student.id,
          labId
        }
      },
      update: {
        attempts: { increment: 1 },
        completedAt: completed ? now : (existingProgress?.completedAt || null),
        score: score !== undefined ? parseFloat(score) : (existingProgress?.score || 0.0),
        timeSpent: { increment: timeSpent || 0 },
        experimentResults: experimentResults ? JSON.stringify(experimentResults) : (existingProgress?.experimentResults || null)
      },
      create: {
        studentId: user.student.id,
        labId,
        attempts: 1,
        completedAt: completed ? now : null,
        score: score !== undefined ? parseFloat(score) : 0.0,
        timeSpent: timeSpent || 0,
        experimentResults: experimentResults ? JSON.stringify(experimentResults) : null
      }
    });

    return NextResponse.json({
      success: true,
      progress: {
        attempts: updatedProgress.attempts,
        completedAt: updatedProgress.completedAt,
        score: updatedProgress.score,
        timeSpent: updatedProgress.timeSpent,
        experimentResults: updatedProgress.experimentResults ? JSON.parse(updatedProgress.experimentResults) : null
      }
    });
  } catch (error: any) {
    console.error('Save lab progress error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
