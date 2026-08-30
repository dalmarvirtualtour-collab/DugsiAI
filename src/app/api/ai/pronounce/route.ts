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
    const quotaResult = await checkUserQuota(session.userId, 'audio');
    if (!quotaResult.allowed) {
      return NextResponse.json(
        {
          error: quotaResult.reason || "403 Limit Exhausted: Daily limit exceeded.",
          limitExhausted: true,
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { text, transcription } = body;

    if (!text || !transcription) {
      return NextResponse.json(
        { error: 'Target text and student spoken transcription are required' },
        { status: 400 }
      );
    }

    // Clean texts for comparison
    const cleanWord = (w: string) => w.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();
    
    const targetWords = text.split(/\s+/).map(cleanWord).filter(Boolean);
    const spokenWords = transcription.split(/\s+/).map(cleanWord).filter(Boolean);

    // Simple comparison scoring (LCS-based or intersection)
    let matches = 0;
    const errors: string[] = [];

    targetWords.forEach((word: string) => {
      if (spokenWords.includes(word)) {
        matches++;
      } else {
        errors.push(word);
      }
    });

    const score = targetWords.length > 0 ? Math.round((matches / targetWords.length) * 100) : 0;

    let feedback = 'Excellent! Your pronunciation is clear and natural.';
    if (score < 50) {
      feedback = 'Keep trying! Focus on enunciating each syllable clearly and matching the model speaker pitch.';
    } else if (score < 85) {
      feedback = 'Very good! Just a few words need correction. Listen to the feedback audio and try again.';
    }

    // Estimate audio duration (seconds) based on transcription word count
    const words = transcription.split(/\s+/).filter(Boolean).length;
    const estimatedDuration = Math.max(1, Math.ceil(words / 2.5)); // ~150 wpm

    const { recordUsage } = await import('@/lib/quota');
    await recordUsage(session.userId, 0, estimatedDuration);

    return NextResponse.json({
      success: true,
      score,
      matches,
      totalWords: targetWords.length,
      mispronounced: errors,
      feedback,
    });
  } catch (error: any) {
    console.error('Pronunciation evaluation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
