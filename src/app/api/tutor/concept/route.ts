import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { getSessionUser } from '@/lib/auth';

const VALID_LOCALES = ['en', 'so', 'om', 'am', 'ti', 'har', 'aa'];

export async function GET(req: NextRequest) {
  try {
    const session = getSessionUser(req);
    const isDev = process.env.NODE_ENV !== 'production';
    const bypassAuth = req.nextUrl.searchParams.get('bypassAuth') === 'true' && isDev;

    if (!session && !bypassAuth) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const conceptId = searchParams.get('conceptId');
    const grade = searchParams.get('grade');
    const subjectParam = searchParams.get('subject');
    const chapterParam = searchParams.get('chapter');
    const lessonParam = searchParams.get('lesson');
    const activeLocale = searchParams.get('activeLocale') || 'en';

    if (!VALID_LOCALES.includes(activeLocale)) {
      return NextResponse.json({ error: `Invalid locale: ${activeLocale}. Supported locales: ${VALID_LOCALES.join(', ')}` }, { status: 400 });
    }

    let conceptDoc: any = null;

    if (conceptId) {
      // 1. Fetch matching concept node from Firestore by conceptId
      const conceptsRef = db.collection('concepts');
      const querySnapshot = await conceptsRef.where('permanent_concept_id', '==', conceptId).get();

      if (!querySnapshot.empty) {
        conceptDoc = querySnapshot.docs[0].data();
      } else {
        const docRef = conceptsRef.doc(conceptId);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
          conceptDoc = docSnap.data();
        }
      }
    } else if (grade && subjectParam) {
      // 2. Fetch dynamically by grade, subject, and chapter/lesson
      const subjectCodes: Record<string, string> = {
        biology: 'BIOL',
        physics: 'PHYS',
        chemistry: 'CHEM',
        mathematics: 'MATH',
        math: 'MATH',
        geography: 'GEOG',
        history: 'HIST',
        civics: 'CIVI',
        english: 'ENGL'
      };
      const subLower = (subjectParam || '').toLowerCase();
      let subCode = '';
      for (const key in subjectCodes) {
        if (subLower.includes(key)) {
          subCode = subjectCodes[key];
          break;
        }
      }

      const conceptsRef = db.collection('concepts');
      const snapshot = await conceptsRef.get();

      for (const doc of snapshot.docs) {
        const data = doc.data();
        const chunkId = data.chunk_id || '';
        const conceptName = (data.concept || '').toLowerCase();
        const titleEn = (data.title?.en || '').toLowerCase();
        
        const matchesGrade = chunkId.includes(`-G${grade}-`) || chunkId.includes(`-G0${grade}-`);
        const matchesSubject = subCode ? chunkId.includes(`-${subCode}-`) : true;
        
        if (matchesGrade && matchesSubject) {
          const chapLower = (chapterParam || '').toLowerCase();
          const lesLower = (lessonParam || '').toLowerCase();
          
          const matchesChapter = chapLower && (conceptName.includes(chapLower) || titleEn.includes(chapLower) || chapLower.includes(conceptName));
          const matchesLesson = lesLower && (conceptName.includes(lesLower) || titleEn.includes(lesLower) || lesLower.includes(conceptName));
          
          if (matchesLesson || matchesChapter) {
            conceptDoc = data;
            break;
          }
        }
      }

      // Fallback to first document matching grade and subject code
      if (!conceptDoc) {
        for (const doc of snapshot.docs) {
          const data = doc.data();
          const chunkId = data.chunk_id || '';
          const matchesGrade = chunkId.includes(`-G${grade}-`) || chunkId.includes(`-G0${grade}-`);
          const matchesSubject = subCode ? chunkId.includes(`-${subCode}-`) : true;
          if (matchesGrade && matchesSubject) {
            conceptDoc = data;
            break;
          }
        }
      }

      // Final fallback: first concept in DB
      if (!conceptDoc && !snapshot.empty) {
        conceptDoc = snapshot.docs[0].data();
      }
    }

    if (!conceptDoc) {
      return NextResponse.json({ error: 'Concept node not found for specified query parameters.' }, { status: 404 });
    }


    // Extract concept fields
    const titleMap = conceptDoc.title || {};
    const descMap = conceptDoc.description || {};
    const chunkId = conceptDoc.chunk_id;

    const conceptData = {
      conceptId: conceptDoc.permanent_concept_id || conceptId,
      concept_name_en: titleMap.en || conceptDoc.concept || '',
      definition_en: descMap.en || '',
      localized_title: titleMap[activeLocale] || titleMap.en || '',
      localized_definition: descMap[activeLocale] || descMap.en || ''
    };

    // 2. Fetch corresponding vocabulary assistance (items in the same chunk)
    const vocabularyList: any[] = [];
    if (chunkId) {
      const vocabRef = db.collection('vocabulary');
      const vocabSnapshot = await vocabRef.where('chunk_id', '==', chunkId).get();
      
      if (!vocabSnapshot.empty) {
        vocabSnapshot.docs.forEach((doc: any) => {
          const vocabData = doc.data();
          const wordMap = vocabData.word || {};
          const contextMap = vocabData.context_sentence || {};
          
          vocabularyList.push({
            word_en: wordMap.en || '',
            localized_word: wordMap[activeLocale] || wordMap.en || '',
            context_sentence_en: contextMap.en || '',
            localized_sentence: contextMap[activeLocale] || contextMap.en || ''
          });
        });
      }
    }

    return NextResponse.json({
      success: true,
      concept: conceptData,
      vocabulary: vocabularyList
    });

  } catch (error: any) {
    console.error('API Tutor Concept Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
