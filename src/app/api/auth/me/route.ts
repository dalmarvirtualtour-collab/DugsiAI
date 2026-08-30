import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionUser(req);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please register or login.' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        student: {
          include: {
            school: true,
          },
        },
        parent: {
          include: {
            students: {
              include: {
                user: true,
                school: true,
              },
            },
          },
        },
        teacher: {
          include: {
            school: true,
          },
        },
        schoolAdmin: {
          include: {
            school: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: {
          userId: user.id,
          plan: 'FREEMIUM',
          status: 'ACTIVE',
        },
      });
    }

    const now = new Date();
    if (
      subscription.plan !== 'FREEMIUM' &&
      subscription.endDate &&
      subscription.endDate < now
    ) {
      subscription = await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          plan: 'FREEMIUM',
          status: 'EXPIRED',
        },
      });

      await prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Subscription Expired',
          content: 'Your regular/premium subscription has expired and has been automatically downgraded to the Freemium plan. Please upgrade to keep enjoying unlimited learning.',
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'DOWNGRADE_AUTO',
          details: 'Subscription downgraded to FREEMIUM due to expiration',
        },
      });
    }

    const todayStr = now.toISOString().split('T')[0];
    const usage = await prisma.aIUsage.findFirst({
      where: {
        userId: user.id,
        date: todayStr,
      },
    });
    const messagesToday = usage ? usage.messageCount : 0;

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        region: user.region,
        preferredLanguage: user.preferredLanguage,
        profilePhoto: user.profilePhoto,
        createdAt: user.createdAt,
        student: user.student,
        parent: user.parent,
        teacher: user.teacher,
        schoolAdmin: user.schoolAdmin,
      },
      subscription: {
        plan: subscription.plan,
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
      },
      usage: {
        messagesToday,
        freeMessagesLeft: Math.max(0, 5 - messagesToday),
      },
    });
  } catch (error: any) {
    console.error('Verify session error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
