const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const pdf = require('pdf-parse');

const prisma = new PrismaClient();

// Helper to clean and format text
function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[^\x20-\x7E\n\t]/g, '') // remove non-printable ASCII characters
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Map filenames to clean subject names
function getSubjectName(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.includes('biology')) return 'Biology';
  if (lower.includes('chemistry')) return 'Chemistry';
  if (lower.includes('physics')) return 'Physics';
  if (lower.includes('math')) return 'Mathematics';
  if (lower.includes('english')) return 'English';
  if (lower.includes('history')) return 'History';
  if (lower.includes('geography')) return 'Geography';
  if (lower.includes('economics')) return 'Economics';
  if (lower.includes('citizenship')) return 'Citizenship';
  if (lower.includes('hpe') || lower.includes('physical')) return 'Health & Physical Education';
  if (lower.includes('it') || lower.includes('information')) return 'Information Technology';
  if (lower.includes('agri')) return 'Agriculture';
  if (lower.includes('drawing') || lower.includes('technical')) return 'Technical Drawing';
  return 'General Studies';
}

interface ParsedLesson {
  title: string;
  lessonNumber: number;
  content: string;
  objectives: string[];
  vocabulary: { word: string; definition: string }[];
  questions: {
    type: 'MCQ' | 'TRUE_FALSE' | 'FILL_BLANK' | 'SHORT_ANSWER';
    text: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  }[];
}

interface ParsedChapter {
  title: string;
  chapterNumber: number;
  lessons: ParsedLesson[];
}

// Smart heuristic to segment text into units/chapters and lessons
function segmentTextbook(text: string, subject: string, grade: number): ParsedChapter[] {
  const chapters: ParsedChapter[] = [];
  let currentChapter: ParsedChapter | null = null;
  let currentLesson: ParsedLesson | null = null;
  
  let chapterCounter = 0;
  let lessonCounter = 0;

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect Unit/Chapter start
    const isUnitHeader = /^(unit|chapter)\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\b/i.test(line);
    
    if (isUnitHeader && line.length < 150) {
      chapterCounter++;
      if (currentChapter && currentLesson) {
        currentChapter.lessons.push(currentLesson);
        currentLesson = null;
      }
      if (currentChapter) {
        chapters.push(currentChapter);
      }

      const chapterName = line.replace(/^(unit|chapter)\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten)[:\s-]*/i, '').trim();
      currentChapter = {
        title: chapterName || `Unit ${chapterCounter}: Core Principles`,
        chapterNumber: chapterCounter,
        lessons: []
      };
      lessonCounter = 0;
      continue;
    }

    // Detect Section/Lesson start
    const isSectionHeader = /^(section\s+)?(\d+\.\d+)\b/i.test(line);
    if (isSectionHeader && line.length < 150) {
      lessonCounter++;
      if (currentChapter) {
        if (currentLesson) {
          currentChapter.lessons.push(currentLesson);
        }
        
        const lessonTitle = line.replace(/^(section\s+)?(\d+\.\d+)[:\s-]*/i, '').trim();
        currentLesson = {
          title: lessonTitle || `Lesson ${lessonCounter}: Core Concepts`,
          lessonNumber: lessonCounter,
          content: '',
          objectives: [],
          vocabulary: [],
          questions: []
        };
      }
      continue;
    }

    // Accumulate content in the active lesson
    if (currentLesson) {
      currentLesson.content += line + '\n';

      // Objective detection
      if (line.toLowerCase().includes('objective') || line.toLowerCase().includes('you will be able to')) {
        const nextLine = lines[i + 1];
        if (nextLine && nextLine.length < 200) {
          currentLesson.objectives.push(nextLine);
        }
      }

      // Vocabulary detection
      const vocabMatch = line.match(/^([A-Za-z\s]{3,30})[:\-]\s+(.{10,150})$/);
      if (vocabMatch) {
        currentLesson.vocabulary.push({
          word: vocabMatch[1].trim(),
          definition: vocabMatch[2].trim()
        });
      }
    }
  }

  // Flush remaining elements
  if (currentChapter) {
    if (currentLesson) {
      currentChapter.lessons.push(currentLesson);
    }
    chapters.push(currentChapter);
  }

  // Fallback if no structured units were parsed
  if (chapters.length === 0) {
    const defaultChapter: ParsedChapter = {
      title: 'Foundational Syllabus Framework',
      chapterNumber: 1,
      lessons: []
    };

    const chunkCount = 5;
    const chunkSize = Math.ceil(lines.length / chunkCount);
    for (let c = 0; c < chunkCount; c++) {
      const chunkLines = lines.slice(c * chunkSize, (c + 1) * chunkSize);
      defaultChapter.lessons.push({
        title: `Syllabus Segment ${c + 1}: Foundational Study`,
        lessonNumber: c + 1,
        content: chunkLines.join('\n'),
        objectives: [`Understand baseline concepts of Grade ${grade} ${subject}`],
        vocabulary: [],
        questions: []
      });
    }
    chapters.push(defaultChapter);
  }

  // Auto-generate sample practice questions for each lesson
  for (const ch of chapters) {
    for (const les of ch.lessons) {
      // 1. MCQ
      les.questions.push({
        type: 'MCQ',
        text: `Which of the following best represents the key principle covered in ${les.title}?`,
        options: [
          'It is a static foundation with no application.',
          `It is a vital core concept of Grade ${grade} ${subject} aligned to the curriculum.`,
          'It is completely unrelated to standard science guidelines.',
          'It only applies in experimental lab settings.'
        ],
        correctAnswer: `It is a vital core concept of Grade ${grade} ${subject} aligned to the curriculum.`,
        explanation: `This lesson discusses the fundamental details of ${les.title} in the context of Grade ${grade} ${subject}.`,
        difficulty: 'MEDIUM'
      });

      // 2. True / False
      les.questions.push({
        type: 'TRUE_FALSE',
        text: `True or False: The concepts introduced in ${les.title} are critical to understanding subsequent topics in ${subject}.`,
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: `Syllabus items in Grade ${grade} ${subject} build incrementally on each other.`,
        difficulty: 'EASY'
      });

      // 3. Fill in the blank
      les.questions.push({
        type: 'FILL_BLANK',
        text: `In the study of ${subject}, ${les.title} is recognized as a primary __________ for student assessment.`,
        options: [],
        correctAnswer: 'foundation',
        explanation: 'The lessons provide the foundation for student exams and quizzes.',
        difficulty: 'HARD'
      });

      // 4. Short answer
      les.questions.push({
        type: 'SHORT_ANSWER',
        text: `Briefly describe the learning outcome of studying ${les.title}.`,
        options: [],
        correctAnswer: `Students gain core knowledge of ${les.title}.`,
        explanation: 'Objectives align with gain of technical proficiency.',
        difficulty: 'MEDIUM'
      });
    }
  }

  return chapters;
}

async function ingestFile(filePath: string, grade: number) {
  const filename = path.basename(filePath);
  const subjectName = getSubjectName(filename);
  const startTime = Date.now();

  const buffer = fs.readFileSync(filePath);
  const data = await pdf(buffer);
  const cleanedText = cleanText(data.text);
  
  const chapters = segmentTextbook(cleanedText, subjectName, grade);

  // Ensure Subject exists
  const subject = await prisma.subject.upsert({
    where: {
      id: `${grade}-${subjectName.toLowerCase().replace(/\s+/g, '-')}`
    },
    update: {},
    create: {
      id: `${grade}-${subjectName.toLowerCase().replace(/\s+/g, '-')}`,
      name: subjectName,
      grade,
      description: `Official Ethiopian Grade ${grade} ${subjectName} textbook.`
    }
  });

  let chaptersCreated = 0;
  let lessonsCreated = 0;
  let questionsCreated = 0;

  for (const ch of chapters) {
    const chapterId = `${subject.id}-ch-${ch.chapterNumber}`;
    await prisma.chapter.upsert({
      where: { id: chapterId },
      update: { name: ch.title },
      create: {
        id: chapterId,
        name: ch.title,
        chapterNumber: ch.chapterNumber,
        subjectId: subject.id
      }
    });
    chaptersCreated++;

    for (const les of ch.lessons) {
      const lessonId = `${chapterId}-les-${les.lessonNumber}`;
      
      // Upsert Lesson
      const lesson = await prisma.lesson.upsert({
        where: { id: lessonId },
        update: {
          title: les.title,
          content: les.content,
          objectives: JSON.stringify(les.objectives),
          vocabulary: JSON.stringify(les.vocabulary),
          definitions: JSON.stringify(les.vocabulary.map(v => v.definition))
        },
        create: {
          id: lessonId,
          title: les.title,
          lessonNumber: les.lessonNumber,
          content: les.content,
          textbookAccess: 'FREEMIUM',
          chapterId: chapterId,
          objectives: JSON.stringify(les.objectives),
          vocabulary: JSON.stringify(les.vocabulary),
          definitions: JSON.stringify(les.vocabulary.map(v => v.definition))
        }
      });
      lessonsCreated++;

      // Upsert English Translation
      await prisma.lessonTranslation.upsert({
        where: {
          lessonId_language: {
            lessonId: lesson.id,
            language: 'en'
          }
        },
        update: {
          title: les.title,
          content: les.content,
          objectives: JSON.stringify(les.objectives),
          vocabulary: JSON.stringify(les.vocabulary),
          definitions: JSON.stringify(les.vocabulary.map(v => v.definition))
        },
        create: {
          lessonId: lesson.id,
          language: 'en',
          title: les.title,
          content: les.content,
          objectives: JSON.stringify(les.objectives),
          vocabulary: JSON.stringify(les.vocabulary),
          definitions: JSON.stringify(les.vocabulary.map(v => v.definition))
        }
      });

      // Write quiz questions
      for (let index = 0; index < les.questions.length; index++) {
        const q = les.questions[index];
        const questionId = `${lesson.id}-q-${index + 1}`;
        await prisma.question.upsert({
          where: { id: questionId },
          update: {
            text: q.text,
            options: JSON.stringify(q.options),
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            difficulty: q.difficulty
          },
          create: {
            id: questionId,
            type: q.type,
            text: q.text,
            options: JSON.stringify(q.options),
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            difficulty: q.difficulty,
            chapterId: chapterId
          }
        });
        questionsCreated++;
      }
    }
  }

  // Record import history entry
  const processingTimeMs = Date.now() - startTime;
  await prisma.importHistory.create({
    data: {
      importedBy: 'AI Ingestion Agent',
      grade,
      subject: subjectName,
      filesProcessed: 1,
      chaptersCount: chaptersCreated,
      lessonsCount: lessonsCreated,
      questionsCount: questionsCreated,
      errors: null,
      warnings: null
    }
  });

  return {
    subject: subjectName,
    chapters: chaptersCreated,
    lessons: lessonsCreated,
    questions: questionsCreated,
    timeMs: processingTimeMs
  };
}

async function main() {
  console.log('--- STARTING MULTIGRADE TEXTBOOK INGESTION ---');
  const startTime = Date.now();
  
  // Resolve textbook path dynamically
  const rootPath = process.env.TEXTBOOK_ROOT_PATH || 'C:\\Users\\Eng SAMATAR\\Desktop\\SILT\\text books';
  console.log(`Scanning textbook root path: ${rootPath}`);

  if (!fs.existsSync(rootPath)) {
    console.error(`Error: Ingestion folder path does not exist: ${rootPath}`);
    process.exit(1);
  }

  // Discover Grade directories dynamically
  const dirs = fs.readdirSync(rootPath).filter((d: string) => {
    const stat = fs.statSync(path.join(rootPath, d));
    return stat.isDirectory() && /grade\s+\d+/i.test(d);
  });

  console.log(`Discovered ${dirs.length} Grade directories: ${dirs.join(', ')}`);

  let totalChapters = 0;
  let totalLessons = 0;
  let totalQuestions = 0;
  let totalFiles = 0;
  const processedPairs = new Set<string>();

  for (const dir of dirs) {
    const gradeNum = parseInt(dir.match(/\d+/)?.[0] || '9', 10);
    const gradePath = path.join(rootPath, dir);
    const files = (fs.readdirSync(gradePath) as string[]).filter((f: string) => f.toLowerCase().endsWith('.pdf'));

    console.log(`\n--- Processing ${dir} (Grade ${gradeNum}) - Found ${files.length} files ---`);

    for (const file of files) {
      const subjectName = getSubjectName(file);
      const uniqueKey = `${gradeNum}-${subjectName}`;

      // Prevent processing duplicate subjects (e.g. G10-Geography-STB-2023-web (1).pdf and G10-Geography-STB-2023-web.pdf)
      if (processedPairs.has(uniqueKey)) {
        console.log(`Skipping duplicate/version file: ${file} (Subject ${subjectName} already processed in this run)`);
        continue;
      }

      // Check ImportHistory to enable resume-on-failure incremental loading
      const existingImport = await prisma.importHistory.findFirst({
        where: {
          grade: gradeNum,
          subject: subjectName,
          errors: null
        }
      });

      if (existingImport) {
        console.log(`Skipping: Grade ${gradeNum} ${subjectName} (Already successfully imported in database history)`);
        processedPairs.add(uniqueKey);
        continue;
      }

      const filePath = path.join(gradePath, file);
      try {
        const stats = await ingestFile(filePath, gradeNum);
        totalChapters += stats.chapters;
        totalLessons += stats.lessons;
        totalQuestions += stats.questions;
        totalFiles++;
        processedPairs.add(uniqueKey);
        console.log(`Successfully Ingested Grade ${gradeNum} ${subjectName} in ${(stats.timeMs / 1000).toFixed(2)}s`);
      } catch (e: any) {
        console.error(`Error ingesting file ${file} in ${dir}:`, e);
        // Record failed import history
        await prisma.importHistory.create({
          data: {
            importedBy: 'AI Ingestion Agent',
            grade: gradeNum,
            subject: subjectName,
            filesProcessed: 0,
            chaptersCount: 0,
            lessonsCount: 0,
            questionsCount: 0,
            errors: JSON.stringify([e.message || 'Unknown error occurred']),
            warnings: null
          }
        });
      }
    }
  }

  const totalTimeSec = (Date.now() - startTime) / 1000;
  console.log('\n--- MULTIGRADE INGESTION COMPLETED SUCCESSFULLY ---');
  console.log(`Total Files Processed: ${totalFiles}`);
  console.log(`Total Chapters Created: ${totalChapters}`);
  console.log(`Total Lessons Created: ${totalLessons}`);
  console.log(`Total Practice Questions Generated: ${totalQuestions}`);
  console.log(`Total Time Elapsed: ${totalTimeSec.toFixed(2)}s`);
}

main()
  .catch((e) => {
    console.error('Fatal multigrade ingestion error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export {};
