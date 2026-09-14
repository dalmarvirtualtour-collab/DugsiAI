import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function GET() {
  try {
    const snapshot = await db.collection('textbook_chunks').select('grade', 'subject').get();
    const map: Record<number, Set<string>> = {};
    snapshot.docs.forEach((doc: any) => {
      const data = doc.data();
      const g = data.grade;
      const s = data.subject;
      if (g && s) {
        if (!map[g]) map[g] = new Set();
        map[g].add(s);
      }
    });
    const result = Object.keys(map).map(g => ({
      grade: parseInt(g, 10),
      subjects: Array.from(map[parseInt(g, 10)]).sort()
    })).sort((a, b) => a.grade - b.grade);
    return NextResponse.json({ success: true, curriculum: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
