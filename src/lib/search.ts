import { prisma } from './prisma';

interface SearchParams {
  query: string;
  grade: number;
  subjectId?: string;
  limit?: number;
}

export async function searchCurriculum(params: SearchParams) {
  const { query, grade, subjectId, limit = 3 } = params;

  if (!query || !query.trim()) {
    return [];
  }

  // Tokenize query into search terms, filtering out very short words
  const terms = query
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(t => t.length > 2);

  if (terms.length === 0) {
    return [];
  }

  // Retrieve lessons belonging to the target grade and subject (if provided)
  const lessons = await prisma.lesson.findMany({
    where: {
      chapter: {
        subject: {
          grade: grade,
          ...(subjectId ? { id: subjectId } : {})
        }
      }
    },
    include: {
      chapter: {
        include: {
          subject: true
        }
      }
    }
  });

  // Score and rank lessons based on term matches in title, content, vocabulary, or objectives
  const scoredLessons = lessons.map(lesson => {
    let score = 0;
    const titleLower = lesson.title.toLowerCase();
    const contentLower = lesson.content.toLowerCase();
    const objectivesLower = (lesson.objectives || '').toLowerCase();
    const vocabularyLower = (lesson.vocabulary || '').toLowerCase();

    terms.forEach(term => {
      // Direct keyword matches increase the relevance score
      if (titleLower.includes(term)) score += 10;
      if (objectivesLower.includes(term)) score += 5;
      if (vocabularyLower.includes(term)) score += 5;
      
      // Count content term occurrences
      const matches = contentLower.match(new RegExp(term, 'g'));
      if (matches) {
        score += matches.length;
      }
    });

    return { lesson, score };
  });

  // Filter out zero matches and sort descending by score
  const results = scoredLessons
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.lesson);

  return results;
}
