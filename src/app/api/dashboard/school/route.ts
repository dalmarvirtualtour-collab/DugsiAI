import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { hashPassword } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionUser(req);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login.' },
        { status: 401 }
      );
    }

    const schoolAdminUser = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        schoolAdmin: {
          include: {
            school: {
              include: {
                students: {
                  include: {
                    user: true,
                    quizAttempts: true,
                  },
                },
                teachers: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!schoolAdminUser || !schoolAdminUser.schoolAdmin) {
      return NextResponse.json(
        { error: 'Forbidden. School dashboard is restricted to school administrator profiles.' },
        { status: 403 }
      );
    }

    const school = schoolAdminUser.schoolAdmin.school;

    // Calculations
    const totalStudents = school.students.length;
    const totalTeachers = school.teachers.length;

    let totalQuizzesAttempted = 0;
    let sumQuizScorePct = 0;

    school.students.forEach((student) => {
      student.quizAttempts.forEach((qa) => {
        totalQuizzesAttempted++;
        sumQuizScorePct += qa.score / qa.totalQuestions;
      });
    });

    const schoolAverageQuizScore =
      totalQuizzesAttempted > 0 ? Math.round((sumQuizScorePct / totalQuizzesAttempted) * 100) : 0;

    // Grade breakdown
    const gradeDistribution: { [key: number]: number } = { 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 };
    school.students.forEach((student) => {
      if (gradeDistribution[student.grade] !== undefined) {
        gradeDistribution[student.grade]++;
      }
    });

    return NextResponse.json({
      success: true,
      schoolProfile: {
        id: school.id,
        name: school.name,
        region: school.region,
        address: school.address,
      },
      stats: {
        totalStudents,
        totalTeachers,
        schoolAverageQuizScore,
        totalQuizzesAttempted,
      },
      gradeDistribution,
      teachers: school.teachers.map((t) => ({
        id: t.id,
        name: t.user.name,
        phone: t.user.phone,
        subject: t.subject,
      })),
      students: school.students.map((s) => ({
        id: s.id,
        name: s.user.name,
        phone: s.user.phone,
        grade: s.grade,
      })),
    });
  } catch (error: any) {
    console.error('School dashboard query error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST endpoint for bulk registering students under this school
export async function POST(req: NextRequest) {
  try {
    const session = getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const schoolAdminUser = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { schoolAdmin: true },
    });

    if (!schoolAdminUser || !schoolAdminUser.schoolAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const schoolId = schoolAdminUser.schoolAdmin.schoolId;
    const body = await req.json();
    const { studentsList } = body; // Array of { name, phone, password, grade }

    if (!studentsList || !Array.isArray(studentsList) || studentsList.length === 0) {
      return NextResponse.json(
        { error: 'Students list is required and must be a non-empty array' },
        { status: 400 }
      );
    }

    let successCount = 0;
    const skippedList = [];

    // Process students sequentially in a loop
    for (const studentData of studentsList) {
      const { name, phone, password, grade } = studentData;
      if (!name || !phone || !password || !grade) {
        skippedList.push({ phone, reason: 'Missing fields' });
        continue;
      }

      let cleanPhone = phone.trim();
      if (cleanPhone.startsWith('0')) {
        cleanPhone = '+251' + cleanPhone.substring(1);
      } else if (!cleanPhone.startsWith('+')) {
        cleanPhone = '+251' + cleanPhone;
      }

      try {
        const existing = await prisma.user.findUnique({ where: { phone: cleanPhone } });
        if (existing) {
          skippedList.push({ phone: cleanPhone, reason: 'Phone already registered' });
          continue;
        }

        const passwordHash = hashPassword(password.toString());

        await prisma.$transaction(async (tx) => {
          const newUser = await tx.user.create({
            data: {
              name,
              phone: cleanPhone,
              passwordHash,
              role: 'STUDENT',
              region: schoolAdminUser.region,
            },
          });

          await tx.student.create({
            data: {
              userId: newUser.id,
              grade: parseInt(grade.toString(), 10),
              parentPhone: '',
              schoolId,
            },
          });

          await tx.subscription.create({
            data: {
              userId: newUser.id,
              plan: 'FREEMIUM',
              status: 'ACTIVE',
            },
          });

          await tx.notification.create({
            data: {
              userId: newUser.id,
              title: 'Welcome to DugsiAI!',
              content: `Your profile was bulk-registered by your School Administrator. You have been assigned the Freemium plan. Log in using your password to start studying!`,
            },
          });
        });

        successCount++;
      } catch (err: any) {
        skippedList.push({ phone: cleanPhone, reason: err.message || 'Database error' });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bulk registration completed. Successfully registered ${successCount} students. Skipped/failed: ${skippedList.length}`,
      registeredCount: successCount,
      skipped: skippedList,
    });
  } catch (error: any) {
    console.error('School bulk register error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
