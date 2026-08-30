const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'dugsiai_super_secret_session_key_2026';
const PORT = process.env.PORT || 3000;
const BASE_URL = `http://127.0.0.1:${PORT}`;

async function runTests() {
  console.log('=== STARTING LABS AUTHORIZATION INTEGRATION TESTS ===');
  console.log(`Connecting to server at ${BASE_URL}...`);

  // 1. Fetch target students from DB
  const g9Student = await prisma.student.findFirst({
    where: { grade: 9 },
    include: { user: true }
  });
  const g10Student = await prisma.student.findFirst({
    where: { grade: 10 },
    include: { user: true }
  });
  const g12Student = await prisma.student.findFirst({
    where: { grade: 12 },
    include: { user: true }
  });

  if (!g9Student || !g10Student || !g12Student) {
    console.error('Error: Could not locate test students in DB. Run database seeding first.');
    process.exit(1);
  }

  // 2. Generate Session Tokens
  const tokenG9 = jwt.sign({ userId: g9Student.userId, role: 'STUDENT', phone: g9Student.user.phone, name: g9Student.user.name }, JWT_SECRET);
  const tokenG10 = jwt.sign({ userId: g10Student.userId, role: 'STUDENT', phone: g10Student.user.phone, name: g10Student.user.name }, JWT_SECRET);
  const tokenG12 = jwt.sign({ userId: g12Student.userId, role: 'STUDENT', phone: g12Student.user.phone, name: g12Student.user.name }, JWT_SECRET);

  // 3. Define Test Cases
  const testCases = [
    {
      name: 'Grade 9 student accessing Grade 7 lab (REVIEW ACCESS)',
      token: tokenG9,
      url: `${BASE_URL}/api/labs/grade7/physics/grade7_physics_buoyancy`,
      expectedStatus: 200
    },
    {
      name: 'Grade 9 student accessing Grade 10 lab (LOCK HIGHER GRADE)',
      token: tokenG9,
      url: `${BASE_URL}/api/labs/grade10/biology/grade10_biology_heart`,
      expectedStatus: 403
    },
    {
      name: 'Grade 10 student accessing Grade 10 lab (PERMIT ENROLLED GRADE)',
      token: tokenG10,
      url: `${BASE_URL}/api/labs/grade10/biology/grade10_biology_heart`,
      expectedStatus: 200
    },
    {
      name: 'Grade 10 student accessing Grade 12 lab (LOCK HIGHER GRADE)',
      token: tokenG10,
      url: `${BASE_URL}/api/labs/grade12/geography/grade12_agriculture_irrigation`, // Locked or non-existent higher grade
      expectedStatus: 403
    },
    {
      name: 'Grade 12 student accessing Grade 10 lab (REVIEW ACCESS)',
      token: tokenG12,
      url: `${BASE_URL}/api/labs/grade10/chemistry/grade10_chemistry_atom`,
      expectedStatus: 200
    }
  ];

  let passed = 0;
  for (const tc of testCases) {
    console.log(`Running: ${tc.name}...`);
    try {
      const response = await fetch(tc.url, {
        method: 'GET',
        headers: {
          'Cookie': `dugsiai_session=${tc.token}`
        }
      });
      const data = await response.json();
      
      if (response.status === tc.expectedStatus) {
        console.log(`  -> PASSED (Received ${response.status} as expected)`);
        passed++;
      } else {
        console.log(`  -> FAILED (Expected ${tc.expectedStatus}, Received ${response.status}). Response:`, data);
      }
    } catch (err) {
      console.log(`  -> FAILED: Could not reach local server. Make sure Next.js is running. Error:`, err.message);
    }
  }

  console.log(`\n=== RESULTS: ${passed}/${testCases.length} TESTS PASSED ===`);
  await prisma.$disconnect();
  
  if (passed !== testCases.length) {
    process.exit(1);
  }
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
