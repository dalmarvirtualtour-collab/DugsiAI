import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
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
        { error: 'Forbidden. Access restricted to administrators.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { paymentId, action } = body; // action = 'APPROVE' | 'REJECT'

    if (!paymentId || !action || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json(
        { error: 'Payment ID and valid action (APPROVE/REJECT) are required' },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    if (payment.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Payment has already been processed. Current status is: ${payment.status}` },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: updatedStatus,
          verifiedAt: new Date(),
          verifiedBy: session.name,
        },
      });

      if (action === 'APPROVE') {
        const now = new Date();
        const expiryDate = new Date();
        expiryDate.setDate(now.getDate() + 30); // Valid for 30 Days

        const existingSub = await tx.subscription.findUnique({
          where: { userId: payment.userId },
        });

        if (existingSub) {
          await tx.subscription.update({
            where: { id: existingSub.id },
            data: {
              plan: payment.plan,
              startDate: now,
              endDate: expiryDate,
              status: 'ACTIVE',
            },
          });
        } else {
          await tx.subscription.create({
            data: {
              userId: payment.userId,
              plan: payment.plan,
              startDate: now,
              endDate: expiryDate,
              status: 'ACTIVE',
            },
          });
        }

        // Notify user of activation
        await tx.notification.create({
          data: {
            userId: payment.userId,
            title: 'Subscription Activated!',
            content: `Congratulations! Your payment for the ${payment.plan.toLowerCase()} plan has been verified. You now have unlimited curriculum access for the next 30 days.`,
          },
        });
      } else {
        // Notify user of rejection
        await tx.notification.create({
          data: {
            userId: payment.userId,
            title: 'Payment Verification Failed',
            content: `Unfortunately, we were unable to verify your payment of ${payment.amount} Birr via ${payment.method}. Please check your transaction references or contact support.`,
          },
        });
      }

      // Record admin action in audit log
      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: `PAYMENT_${action}`,
          details: `${action}D payment of ${payment.amount} Birr (ID: ${payment.id}) for user ID ${payment.userId}`,
        },
      });

      return updatedPayment;
    });

    return NextResponse.json({
      success: true,
      message: `Payment successfully ${action === 'APPROVE' ? 'approved' : 'rejected'}.`,
      payment: result,
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
