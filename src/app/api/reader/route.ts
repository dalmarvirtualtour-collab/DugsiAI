import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gradeSubjectId = searchParams.get('grade_subject_id') || '';
    const gradeParam = searchParams.get('grade') || '';
    const subjectParam = searchParams.get('subject') || '';
    const pageStr = searchParams.get('page_number') || searchParams.get('page') || '1';
    const pageNum = parseInt(pageStr, 10) || 1;

    // Parse grade number
    let grade = 9;
    const combined = `${gradeSubjectId} ${gradeParam}`;
    const gradeMatch = combined.match(/grade[_-]?(\d+)/i) || combined.match(/\d+/);
    if (gradeMatch) {
      grade = parseInt(gradeMatch[1] || gradeMatch[0], 10);
    }

    // Parse subject name
    let subject = subjectParam;
    if (!subject && gradeSubjectId) {
      const parts = gradeSubjectId.replace(/^grade[_-]?\d+[_-]?/i, '').replace(/_/g, ' ').trim();
      if (parts) subject = parts;
    }

    let query: any = db.collection('textbook_chunks').where('grade', '==', grade);
    const snapshot = await query.get();

    if (snapshot.empty) {
      // Fallback if grade is not found in textbook_chunks, grab any available chunk for demonstration
      const anySnap = await db.collection('textbook_chunks').limit(1).get();
      if (anySnap.empty) {
        return NextResponse.json({ success: false, error: 'No textbook chunks found in database' }, { status: 404 });
      }
      const data = anySnap.docs[0].data();
      return NextResponse.json({
        success: true,
        data: {
          content: data.raw_sample || data.summary || '',
          summary: data.summary || '',
          subject: data.subject || subject,
          grade: data.grade || grade,
          start_page: data.start_page || 1,
          end_page: data.end_page || 10,
          vocab_anchors: []
        }
      });
    }

    // Match subject case-insensitively
    let docs = snapshot.docs;
    if (subject && subject.toLowerCase() !== 'all') {
      const lowerSub = subject.toLowerCase();
      const filtered = docs.filter((d: any) => {
        const s = (d.data().subject || '').toLowerCase();
        return s.includes(lowerSub) || lowerSub.includes(s);
      });
      if (filtered.length > 0) docs = filtered;
    }

    // Find chunk matching requested page
    let targetDoc = docs.find((d: any) => {
      const data = d.data();
      return pageNum >= (data.start_page || 0) && pageNum <= (data.end_page || 9999);
    }) || docs[0];

    const data = targetDoc.data();
    const contentText = data.raw_sample || data.summary || '';

    return NextResponse.json({
      success: true,
      data: {
        content: contentText,
        summary: data.summary || '',
        subject: data.subject,
        grade: data.grade,
        start_page: data.start_page,
        end_page: data.end_page,
        vocab_anchors: []
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
