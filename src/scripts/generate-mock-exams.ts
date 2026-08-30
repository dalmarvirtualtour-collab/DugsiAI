const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- GENERATING MOCK EXAMS FROM INGESTED CURRICULUM ---');

  // Fetch all subjects in the database
  const subjects = await prisma.subject.findMany({
    include: {
      chapters: {
        include: {
          questions: true
        }
      }
    }
  });

  console.log(`Found ${subjects.length} subjects to review.`);

  let mockExamsCreated = 0;

  for (const subject of subjects) {
    const allQuestions = subject.chapters.flatMap((ch: any) => ch.questions);
    
    if (allQuestions.length === 0) {
      console.log(`Skipping subject ${subject.name} (Grade ${subject.grade}) - No questions found.`);
      continue;
    }

    const questionIds = allQuestions.map((q: any) => q.id);
    const mockExamId = `${subject.id}-mock-exam`;
    const examTitle = `Grade ${subject.grade} ${subject.name} National Prep Mock Examination`;

    await prisma.mockExam.upsert({
      where: { id: mockExamId },
      update: {
        title: examTitle,
        questionsList: JSON.stringify(questionIds.slice(0, 50)) // link up to 50 questions
      },
      create: {
        id: mockExamId,
        title: examTitle,
        grade: subject.grade,
        subjectId: subject.id,
        durationMinutes: 90,
        questionsList: JSON.stringify(questionIds.slice(0, 50))
      }
    });

    mockExamsCreated++;
    console.log(`Created Mock Exam: "${examTitle}" with ${Math.min(50, questionIds.length)} questions.`);
  }

  console.log(`\n--- MOCK EXAM GENERATION FINISHED. Created ${mockExamsCreated} exams ---`);
}

main()
  .catch((e) => {
    console.error('Mock exam generation error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export {};
