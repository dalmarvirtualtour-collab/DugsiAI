import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gradeParam = searchParams.get('grade') || searchParams.get('grade_subject_id');
    const subject = searchParams.get('subject');
    const pageStr = searchParams.get('page_number') || searchParams.get('page') || '1';
    const pageNum = parseInt(pageStr, 10);

    let grade = 10;
    if (gradeParam) {
      const match = gradeParam.match(/\d+/);
      if (match) grade = parseInt(match[0], 10);
    }

    let query = db.collection('textbook_chunks').where('grade', '==', grade);
    if (subject && subject.toLowerCase() !== 'all') {
      query = query.where('subject', '==', subject);
    }

    const snapshot = await query.get();
    if (snapshot.empty) {
      return NextResponse.json({ success: false, error: 'No content found' }, { status: 404 });
    }

    let targetDoc = snapshot.docs.find((doc: any) => {
      const data = doc.data();
      return pageNum >= (data.start_page || 0) && pageNum <= (data.end_page || 9999);
    }) || snapshot.docs[0];

    const data = targetDoc.data();
    return NextResponse.json({
      success: true,
      data: {
        page_content: data.raw_sample || data.summary || '',
        summary: data.summary || '',
        subject: data.subject,
        grade: data.grade,
        start_page: data.start_page,
        end_page: data.end_page,
        total_chunks: snapshot.size
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
