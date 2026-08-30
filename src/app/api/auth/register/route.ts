import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      phone,
      password,
      role = 'STUDENT',
      region = 'Somali',
      preferredLanguage = 'en',
      grade,
      schoolName,
      parentPhone,
      subject,
    } = body;

    if (!name || !phone || !password) {
      return NextResponse.json(
        { error: 'Name, phone, and password are required' },
        { status: 400 }
      );
    }

    let cleanPhone = phone.trim();
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '+251' + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith('+')) {
      cleanPhone = '+251' + cleanPhone;
    }

    const existingUser = await prisma.user.findUnique({
      where: { phone: cleanPhone },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this phone number already registered' },
        { status: 400 }
      );
    }

    const passwordHash = hashPassword(password);

    const user = await prisma.$transaction(async (tx) => {
      let schoolId: string | null = null;
      if (schoolName) {
        let school = await tx.school.findFirst({
          where: { name: schoolName },
        });
        if (!school) {
          school = await tx.school.create({
            data: {
              name: schoolName,
              region: region,
            },
          });
        }
        schoolId = school.id;
      }

      const newUser = await tx.user.create({
        data: {
          name,
          phone: cleanPhone,
          passwordHash,
          role,
          region,
          preferredLanguage,
        },
      });

      if (role === 'STUDENT') {
        const cleanParentPhone = parentPhone ? (parentPhone.trim().startsWith('0') ? '+251' + parentPhone.trim().substring(1) : (parentPhone.trim().startsWith('+') ? parentPhone.trim() : '+251' + parentPhone.trim())) : '';
        
        let parentId: string | null = null;
        if (cleanParentPhone) {
          const parentUser = await tx.user.findFirst({
            where: { phone: cleanParentPhone, role: 'PARENT' },
            include: { parent: true },
          });
          if (parentUser && parentUser.parent) {
            parentId = parentUser.parent.id;
          }
        }

        await tx.student.create({
          data: {
            userId: newUser.id,
            grade: parseInt(grade || '7', 10),
            parentPhone: cleanParentPhone,
            schoolId,
            parentId,
          },
        });
      } else if (role === 'PARENT') {
        const parent = await tx.parent.create({
          data: {
            userId: newUser.id,
          },
        });

        await tx.student.updateMany({
          where: { parentPhone: cleanPhone },
          data: { parentId: parent.id },
        });
      } else if (role === 'TEACHER') {
        if (!schoolId) throw new Error('School is required for Teachers');
        await tx.teacher.create({
          data: {
            userId: newUser.id,
            schoolId,
            subject: subject || 'General Science',
          },
        });
      } else if (role === 'SCHOOL_ADMIN') {
        if (!schoolId) throw new Error('School is required for School Admins');
        await tx.schoolAdmin.create({
          data: {
            userId: newUser.id,
            schoolId,
          },
        });
      }

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
          title: `Welcome to DugsiAI, ${name}!`,
          content: `You have registered successfully as a ${role.toLowerCase()}. Enjoy your free AI Tutor usage of 5 messages/day and start studying your curriculum textbooks today!`,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: newUser.id,
          action: 'REGISTER',
          details: `User registered with role ${role} and phone ${cleanPhone}`,
        },
      });

      return newUser;
    });

    const token = signToken({
      userId: user.id,
      role: user.role,
      phone: user.phone,
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        region: user.region,
        preferredLanguage: user.preferredLanguage,
      },
    });

    response.cookies.set({
      name: 'dugsiai_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
