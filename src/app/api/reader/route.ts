import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const grade_subject_id = searchParams.get('grade_subject_id');
    const chapter_id = searchParams.get('chapter_id');
    const lesson_id = searchParams.get('lesson_id');
    const page_number = searchParams.get('page_number');

    if (!grade_subject_id || !chapter_id || !lesson_id || !page_number) {
      return NextResponse.json(
        { error: 'Missing required query parameters: grade_subject_id, chapter_id, lesson_id, page_number' },
        { status: 400 }
      );
    }

    // Direct Firestore fetch
    const pageRef = db.collection('curriculum').doc(grade_subject_id)
                      .collection('chapters').doc(chapter_id)
                      .collection('lessons').doc(lesson_id)
                      .collection('pages').doc(page_number);

    const doc = await pageRef.get();
    
    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Page not found in Firestore curriculum collection.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: doc.data()
    });
  } catch (error: any) {
    console.error('Direct Firestore Reader API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
