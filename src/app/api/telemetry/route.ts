import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { db } from '@/lib/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const session = getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { type, chapterId, secondsActive, scrollSpeed, clicks, questionId, latencySeconds, isCorrect, errorTag } = body;

    const todayStr = new Date().toISOString().split('T')[0];

    if (type === 'attendance') {
      // Record daily attendance in audit logs and update user streak if applicable
      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: 'DAILY_ATTENDANCE',
          details: `User active on date ${todayStr}`,
        },
      });

      return NextResponse.json({ success: true, message: 'Attendance tracked' });
    }

    if (type === 'reading') {
      if (!chapterId) {
        return NextResponse.json({ error: 'Chapter ID is required for reading telemetry' }, { status: 400 });
      }

      // Log reading activity
      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: 'READING_VELOCITY',
          details: `Spent ${secondsActive}s reading Chapter ${chapterId}. Scroll speed: ${scrollSpeed}, Clicks: ${clicks}`,
        },
      });

      // Update competency mapping if active reading was completed
      if (secondsActive > 20 && scrollSpeed > 0) {
        const competencyRef = db.collection('competencyMaps').doc(session.userId);
        const doc = await competencyRef.get();
        let mapData: Record<string, number> = {};

        if (doc.exists) {
          mapData = doc.data() || {};
        }

        const currentVal = mapData[chapterId] || 0.2; // default base level
        // Reading raises competency slightly
        const newVal = Math.min(1.0, currentVal + (1.0 - currentVal) * 0.05);
        mapData[chapterId] = parseFloat(newVal.toFixed(2));

        await competencyRef.set(mapData, { merge: true });
      }

      return NextResponse.json({ success: true });
    }

    if (type === 'diagnostic') {
      if (!chapterId || !questionId) {
        return NextResponse.json({ error: 'Chapter ID and Question ID are required for diagnostic telemetry' }, { status: 400 });
      }

      // Update competency mapping based on correctness and error tagging
      const competencyRef = db.collection('competencyMaps').doc(session.userId);
      const doc = await competencyRef.get();
      let mapData: Record<string, number> = {};

      if (doc.exists) {
        mapData = doc.data() || {};
      }

      const currentVal = mapData[chapterId] || 0.4; // default base level
      let newVal = currentVal;

      if (isCorrect) {
        // Correct answer pushes competency higher
        newVal = currentVal + (1.0 - currentVal) * 0.15;
      } else {
        // Wrong answer drops competency, vocabulary gaps drop it less
        const penalty = errorTag === 'VOCABULARY_GAP' ? 0.04 : 0.08;
        newVal = Math.max(0.0, currentVal - penalty);
      }

      mapData[chapterId] = parseFloat(newVal.toFixed(2));
      await competencyRef.set(mapData, { merge: true });

      // Save audit log
      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: 'DIAGNOSTIC_ANSWER',
          details: `Question ${questionId} in Chapter ${chapterId} - Correct: ${isCorrect}. Latency: ${latencySeconds}s. ErrorTag: ${errorTag || 'None'}`,
        },
      });

      return NextResponse.json({ success: true, newCompetency: mapData[chapterId] });
    }

    return NextResponse.json({ error: 'Invalid telemetry type' }, { status: 400 });
  } catch (error: any) {
    console.error('Telemetry route error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
