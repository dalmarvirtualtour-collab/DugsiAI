import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const term_id = searchParams.get('term_id');

    if (!term_id) {
      return NextResponse.json(
        { error: 'Missing query parameter: term_id' },
        { status: 400 }
      );
    }

    // Direct Firestore fetch by querying word.en
    const vocabRef = db.collection('vocabulary');
    let snapshot = await vocabRef.where('word.en', '==', term_id).get();
    
    if (snapshot.empty) {
      // Try capitalized version as fallback
      const capitalized = term_id.charAt(0).toUpperCase() + term_id.slice(1);
      snapshot = await vocabRef.where('word.en', '==', capitalized).get();
    }
    
    if (snapshot.empty) {
      return NextResponse.json(
        { error: `Vocabulary term '${term_id}' not found in Firestore.` },
        { status: 404 }
      );
    }

    const doc = snapshot.docs[0];
    const vocabData = doc.data();
    
    // Normalize format to match VocabTerm interface:
    const term = vocabData.word?.en || term_id;
    const definitions = vocabData.definitions || {
      en: vocabData.word?.en || '',
      so: vocabData.word?.so || vocabData.word?.en || '',
      om: vocabData.word?.om || vocabData.word?.en || '',
      am: vocabData.word?.am || vocabData.word?.en || ''
    };

    const context = vocabData.context || {
      example_sentences: {
        en: vocabData.context_sentence?.en || '',
        so: vocabData.context_sentence?.so || vocabData.context_sentence?.en || '',
        om: vocabData.context_sentence?.om || vocabData.context_sentence?.en || '',
        am: vocabData.context_sentence?.am || vocabData.context_sentence?.en || ''
      },
      image_urls: []
    };

    return NextResponse.json({
      success: true,
      data: {
        term,
        definitions,
        context
      }
    });
  } catch (error: any) {
    console.error('Direct Firestore Vocab API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
