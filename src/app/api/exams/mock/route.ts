import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { getSessionUser } from '@/lib/auth';

// Helper to determine Level from XP
function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export async function GET(req: NextRequest) {
  try {
    const session = getSessionUser(req);
    const isDev = process.env.NODE_ENV !== 'production';
    const bypassAuth = req.nextUrl.searchParams.get('bypassAuth') === 'true' && isDev;

    // Use a fallback user ID if bypassed in development
    const userId = session?.userId || (bypassAuth ? 'mock_user_123' : null);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Retrieve metrics from Firestore student_metrics collection
    const docRef = db.collection('student_metrics').doc(userId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return NextResponse.json({ success: true, metrics: docSnap.data() });
    }

    // Baseline fallback if no record exists yet
    const baselineMetrics = {
      userId,
      xp: 120,
      level: 1,
      streak: 3, // days active streak
      lastActive: new Date().toISOString().split('T')[0],
      personalRecords: {
        "ESSLCE-2024-Physics": 85,
        "EUEEE-2023-Mathematics": 92
      },
      velocityMetrics: {
        averageSecondsPerQuestion: 45.5,
        totalQuestionsAnswered: 150
      }
    };

    return NextResponse.json({ success: true, metrics: baselineMetrics });

  } catch (error: any) {
    console.error('Gamified metrics GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionUser(req);
    const isDev = process.env.NODE_ENV !== 'production';
    const bypassAuth = req.nextUrl.searchParams.get('bypassAuth') === 'true' && isDev;

    const userId = session?.userId || (bypassAuth ? 'mock_user_123' : null);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { examId, score, secondsSpent, questionsCount } = body;

    if (!examId || score === undefined || !secondsSpent || !questionsCount) {
      return NextResponse.json({ error: 'Missing parameters: examId, score, secondsSpent, questionsCount' }, { status: 400 });
    }

    const docRef = db.collection('student_metrics').doc(userId);
    const docSnap = await docRef.get();

    let currentMetrics = docSnap.exists ? docSnap.data() : {
      userId,
      xp: 0,
      level: 1,
      streak: 0,
      lastActive: "",
      personalRecords: {},
      velocityMetrics: {
        averageSecondsPerQuestion: 0,
        totalQuestionsAnswered: 0
      }
    };

    // 1. Calculate Streak
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (currentMetrics.lastActive === yesterdayStr) {
      currentMetrics.streak += 1;
    } else if (currentMetrics.lastActive !== todayStr) {
      currentMetrics.streak = 1;
    }
    currentMetrics.lastActive = todayStr;

    // 2. XP Gain (base 50 XP, score bonus, streak multiplier)
    const baseXP = 50;
    const scoreBonus = Math.floor(score);
    const streakBonus = currentMetrics.streak * 5;
    const xpGained = baseXP + scoreBonus + streakBonus;
    currentMetrics.xp += xpGained;

    // 3. Leveling calculations
    const newLevel = calculateLevel(currentMetrics.xp);
    const leveledUp = newLevel > currentMetrics.level;
    currentMetrics.level = newLevel;

    // 4. Personal Record checks
    const previousPR = currentMetrics.personalRecords[examId] || 0;
    const isNewPR = score > previousPR;
    if (isNewPR) {
      currentMetrics.personalRecords[examId] = score;
    }

    // 5. Velocity metrics: weighted running average of solving speed
    const currentVelocity = currentMetrics.velocityMetrics;
    const currentTotalQ = currentVelocity.totalQuestionsAnswered;
    const totalNewQuestions = currentTotalQ + questionsCount;
    
    const averageSec = ((currentVelocity.averageSecondsPerQuestion * currentTotalQ) + secondsSpent) / totalNewQuestions;
    currentMetrics.velocityMetrics = {
      averageSecondsPerQuestion: parseFloat(averageSec.toFixed(1)),
      totalQuestionsAnswered: totalNewQuestions
    };

    // Save updated statistics to Firestore
    await docRef.set(currentMetrics);

    return NextResponse.json({
      success: true,
      message: leveledUp ? "Level Up!" : "Score Ingested Successfully",
      xpGained,
      leveledUp,
      isNewPR,
      metrics: currentMetrics
    });

  } catch (error: any) {
    console.error('Gamified metrics POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
