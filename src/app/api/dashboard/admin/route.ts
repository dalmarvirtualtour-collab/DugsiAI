import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionUser(req);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login.' },
        { status: 401 }
      );
    }

    if (session.role !== 'SUPER_ADMIN' && !session.role.toLowerCase().includes('admin')) {
      return NextResponse.json(
        { error: 'Forbidden. Access restricted to super administrators.' },
        { status: 403 }
      );
    }

    // platform metrics
    const totalUsers = await prisma.user.count();
    const studentCount = await prisma.student.count();
    const parentCount = await prisma.parent.count();
    const teacherCount = await prisma.teacher.count();
    const schoolCount = await prisma.school.count();
    const pendingPaymentsCount = await prisma.payment.count({ where: { status: 'PENDING' } });
    const approvedPaymentsCount = await prisma.payment.count({ where: { status: 'APPROVED' } });
    
    // Revenue calculations
    const approvedPayments = await prisma.payment.findMany({
      where: { status: 'APPROVED' },
      select: { amount: true },
    });
    const totalRevenue = approvedPayments.reduce((sum, p) => sum + p.amount, 0);

    // active sub tiers count
    const activeSubs = await prisma.subscription.findMany({
      where: { status: 'ACTIVE' },
      select: { plan: true },
    });

    const activeTiers = {
      FREEMIUM: activeSubs.filter(s => s.plan === 'FREEMIUM').length,
      REGULAR: activeSubs.filter(s => s.plan === 'REGULAR').length,
      PREMIUM: activeSubs.filter(s => s.plan === 'PREMIUM').length,
    };

    // audit logs
    const auditLogs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        user: {
          select: {
            name: true,
            role: true,
          },
        },
      },
    });

    // support requests
    const supportRequests = await prisma.supportRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // pending payment detail rows
    const pendingPayments = await prisma.payment.findMany({
      where: { status: 'PENDING' },
      include: {
        user: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        studentCount,
        parentCount,
        teacherCount,
        schoolCount,
        pendingPaymentsCount,
        approvedPaymentsCount,
        totalRevenue,
        activeTiers,
      },
      auditLogs,
      supportRequests,
      pendingPayments,
    });
  } catch (error: any) {
    console.error('Superadmin dashboard query error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
