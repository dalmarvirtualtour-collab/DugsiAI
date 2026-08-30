const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding DugsiAI database...');

  // 1. Clear database
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.aIUsage.deleteMany({});
  await prisma.aIMessage.deleteMany({});
  await prisma.aIConversation.deleteMany({});
  await prisma.quizAttempt.deleteMany({});
  await prisma.examAttempt.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.chapter.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.parent.deleteMany({});
  await prisma.teacher.deleteMany({});
  await prisma.schoolAdmin.deleteMany({});
  await prisma.school.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.systemSetting.deleteMany({});

  // 2. Hash default passwords
  const adminPasswordHash = bcrypt.hashSync('AdminPassword123!', 10);
  const studentPasswordHash = bcrypt.hashSync('StudentPassword123!', 10);
  const parentPasswordHash = bcrypt.hashSync('ParentPassword123!', 10);
  const teacherPasswordHash = bcrypt.hashSync('TeacherPassword123!', 10);

  // 3. Create Schools
  console.log('Creating schools...');
  const gypsumSchool = await prisma.school.create({
    data: {
      name: 'Gypsum Academy',
      region: 'Somali',
      address: 'Jigjiga Zone 3',
    },
  });

  const omarSchool = await prisma.school.create({
    data: {
      name: 'Omar bin Al-Khattab Secondary School',
      region: 'Somali',
      address: 'Jigjiga Center',
    },
  });

  // 4. Create Users and Roles
  console.log('Creating users...');
  
  // Super Admin
  const superAdminUser = await prisma.user.create({
    data: {
      name: 'Samatar Ibrahim',
      phone: '+251930379676',
      email: 'samatar@dugsiai.com',
      passwordHash: adminPasswordHash,
      role: 'SUPER_ADMIN',
      region: 'Somali',
      preferredLanguage: 'en',
    },
  });

  // School Admin
  const schoolAdminUser = await prisma.user.create({
    data: {
      name: 'Gypsum Administrator',
      phone: '+251911111111',
      passwordHash: adminPasswordHash,
      role: 'SCHOOL_ADMIN',
      region: 'Somali',
    },
  });

  const schoolAdmin = await prisma.schoolAdmin.create({
    data: {
      userId: schoolAdminUser.id,
      schoolId: gypsumSchool.id,
    },
  });

  // Parent
  const parentUser = await prisma.user.create({
    data: {
      name: 'Yusuf Hodan',
      phone: '+251998765432',
      passwordHash: parentPasswordHash,
      role: 'PARENT',
      region: 'Somali',
    },
  });

  const parent = await prisma.parent.create({
    data: {
      userId: parentUser.id,
    },
  });

  // Student
  const studentUser = await prisma.user.create({
    data: {
      name: 'Hodan Yusuf',
      phone: '+251912345678',
      email: 'hodan@gypsum.edu',
      passwordHash: studentPasswordHash,
      role: 'STUDENT',
      region: 'Somali',
      preferredLanguage: 'so',
    },
  });

  const student = await prisma.student.create({
    data: {
      userId: studentUser.id,
      grade: 11,
      parentPhone: '+251998765432',
      parentId: parent.id,
      schoolId: gypsumSchool.id,
    },
  });

  // Teacher
  const teacherUser = await prisma.user.create({
    data: {
      name: 'Ustaad Farah',
      phone: '+251955555555',
      passwordHash: teacherPasswordHash,
      role: 'TEACHER',
      region: 'Somali',
    },
  });

  await prisma.teacher.create({
    data: {
      userId: teacherUser.id,
      schoolId: gypsumSchool.id,
      subject: 'Chemistry',
    },
  });

  // 5. Create Subscriptions
  await prisma.subscription.create({
    data: {
      userId: superAdminUser.id,
      plan: 'PREMIUM',
      status: 'ACTIVE',
    },
  });

  await prisma.subscription.create({
    data: {
      userId: studentUser.id,
      plan: 'FREEMIUM',
      status: 'ACTIVE',
    },
  });

  // 6. Create Curriculum Subjects (Grades 11 and 12 for testing)
  console.log('Seeding subjects and chapters...');
  const chemSub = await prisma.subject.create({
    data: { name: 'Chemistry', grade: 11, description: 'Core Grade 11 Chemistry' },
  });

  const physSub = await prisma.subject.create({
    data: { name: 'Physics', grade: 11, description: 'Core Grade 11 Physics' },
  });

  const mathSub = await prisma.subject.create({
    data: { name: 'Mathematics', grade: 11, description: 'Core Grade 11 Math' },
  });

  const bioSub = await prisma.subject.create({
    data: { name: 'Biology', grade: 9, description: 'Core Grade 9 Biology' },
  });

  // Chemistry Chapters & Lessons
  const chemChapter = await prisma.chapter.create({
    data: {
      name: 'Collision Theory & Reaction Rates',
      chapterNumber: 3,
      subjectId: chemSub.id,
    },
  });

  await prisma.lesson.create({
    data: {
      title: 'Collision Frequency & Energy Barriers',
      lessonNumber: 1,
      textbookAccess: 'FREEMIUM',
      content: `### Grade 11 Chemistry: Collision Frequency
For a chemical reaction to occur, reacting species must collide. However, not all collisions result in products. 
A collision is only effective if:
1. **Sufficient Kinetic Energy:** The particles possess kinetic energy equal to or exceeding the Activation Energy ($E_a$).
2. **Proper Alignment:** The molecules align correctly at impact.`,
      chapterId: chemChapter.id,
    },
  });

  await prisma.lesson.create({
    data: {
      title: 'How Catalysts Speeds Up Rates',
      lessonNumber: 2,
      textbookAccess: 'REGULAR',
      content: `### Catalyst Reaction Paths
A catalyst is a substance that accelerates chemical reactions without undergoing permanent chemical changes.
It works by providing an alternative pathway with a **lower Activation Energy ($E_a$)**. This allows a larger fraction of reactant particles to collide effectively at a given temperature.`,
      chapterId: chemChapter.id,
    },
  });

  // Question bank for Chemistry Quiz
  console.log('Creating question bank...');
  const q1 = await prisma.question.create({
    data: {
      type: 'MCQ',
      text: 'According to collision theory, why does a temperature increase accelerate chemical reaction rates?',
      options: JSON.stringify([
        'It decreases the activation energy barrier.',
        'It decreases the volume of solution.',
        'It increases the average kinetic energy, boosting effective collision frequency.',
        'It alters catalyst thermodynamics.'
      ]),
      correctAnswer: 'It increases the average kinetic energy, boosting effective collision frequency.',
      explanation: 'Temperature is directly proportional to kinetic energy. Raising temperature speed up particles, leading to more high-energy collisions.',
      difficulty: 'MEDIUM',
      chapterId: chemChapter.id,
    },
  });

  const q2 = await prisma.question.create({
    data: {
      type: 'MCQ',
      text: 'What is the role of a catalyst in a chemical reaction?',
      options: JSON.stringify([
        'To increase activation energy.',
        'To lower activation energy by offering an alternate pathway.',
        'To consume reactants.',
        'To decrease product yield.'
      ]),
      correctAnswer: 'To lower activation energy by offering an alternate pathway.',
      explanation: 'A catalyst offers an alternative reaction mechanism with lower activation energy, accelerating reaction rates.',
      difficulty: 'EASY',
      chapterId: chemChapter.id,
    },
  });

  // Physics Chapters, Lessons & Questions
  const physChapter = await prisma.chapter.create({
    data: {
      name: 'Gravitation & Gravitational Fields',
      chapterNumber: 4,
      subjectId: physSub.id,
    },
  });

  await prisma.lesson.create({
    data: {
      title: 'Newton\'s Law of Universal Gravitation',
      lessonNumber: 1,
      textbookAccess: 'FREEMIUM',
      content: `### Newton\'s Gravitation Law
Newton\'s Law of Universal Gravitation states that any two bodies in the universe attract each other with a force proportional to the product of their masses and inversely proportional to the square of the distance between them:
$$F = G \\frac{m_1 m_2}{r^2}$$
Where $G \\approx 6.674 \\times 10^{-11} \\text{ N m}^2/\\text{kg}^2$ is the gravitational constant.`,
      chapterId: physChapter.id,
    },
  });

  const pq1 = await prisma.question.create({
    data: {
      type: 'MCQ',
      text: 'How does the gravitational force change if the distance between two masses is doubled?',
      options: JSON.stringify([
        'It is doubled.',
        'It is halved.',
        'It increases by a factor of 4.',
        'It decreases by a factor of 4.'
      ]),
      correctAnswer: 'It decreases by a factor of 4.',
      explanation: 'Since force is inversely proportional to distance squared ($F \\propto 1/r^2$), doubling the distance ($2r$) decreases force by a factor of $2^2 = 4$.',
      difficulty: 'HARD',
      chapterId: physChapter.id,
    },
  });

  // Mathematics Chapters, Lessons & Questions
  const mathChapter = await prisma.chapter.create({
    data: {
      name: 'Matrices & Determinants',
      chapterNumber: 2,
      subjectId: mathSub.id,
    },
  });

  await prisma.lesson.create({
    data: {
      title: '2x2 Matrix Determinants & Inverses',
      lessonNumber: 1,
      textbookAccess: 'FREEMIUM',
      content: `### Matrices Basics
For a 2x2 matrix $A = \\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}$, the determinant is det(A) = ad - bc.
If det(A) is not zero, the matrix is invertible, and its inverse is:
$$A^{-1} = \\frac{1}{ad-bc} \\begin{bmatrix} d & -b \\\\ -c & a \\end{bmatrix}$$`,
      chapterId: mathChapter.id,
    },
  });

  const mq1 = await prisma.question.create({
    data: {
      type: 'MCQ',
      text: 'What is the determinant of the matrix [[3, 2], [1, 4]]?',
      options: JSON.stringify(['10', '14', '7', '12']),
      correctAnswer: '10',
      explanation: 'det = (3 * 4) - (2 * 1) = 12 - 2 = 10.',
      difficulty: 'EASY',
      chapterId: mathChapter.id,
    },
  });

  // 7. Create Mock Exam Templates
  console.log('Seeding mock exams...');
  await prisma.mockExam.create({
    data: {
      title: 'Grade 11 Physics ESSLCE Mock Preparation',
      grade: 11,
      subjectId: physSub.id,
      durationMinutes: 60,
      questionsList: JSON.stringify([pq1.id]),
    },
  });

  await prisma.mockExam.create({
    data: {
      title: 'Grade 11 Chemistry ESSLCE Practice Exam',
      grade: 11,
      subjectId: chemSub.id,
      durationMinutes: 90,
      questionsList: JSON.stringify([q1.id, q2.id]),
    },
  });

  // 8. Seeding System Settings
  await prisma.systemSetting.create({
    data: {
      key: 'payment_phone_number',
      value: '+251930379676',
    },
  });

  console.log('Database seeding successfully finished!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
