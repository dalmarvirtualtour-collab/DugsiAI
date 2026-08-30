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

    const body = await req.json();
    const {
      plan,
      amount,
      method,
      senderPhone,
      transactionRef,
      smsConfirmation,
      screenshotUrl,
    } = body;

    if (!plan || !amount || !method || !senderPhone || !smsConfirmation) {
      return NextResponse.json(
        { error: 'Plan, amount, method, sender phone, and SMS confirmation are required' },
        { status: 400 }
      );
    }

    // Verify that transactionRef is present and satisfies 10-15 alphanumeric format
    if (!transactionRef || !/^[a-zA-Z0-9]{10,15}$/.test(transactionRef)) {
      return NextResponse.json(
        { error: 'Transaction ID / Reference must be exactly 10-15 alphanumeric characters.' },
        { status: 400 }
      );
    }

    // 1. Unique Transaction Rule check in Firestore
    const { db } = await import('@/lib/firebaseAdmin');
    try {
      await db.runTransaction(async (transaction: any) => {
        const paymentRef = db.collection('payments').doc(transactionRef);
        const doc = await transaction.get(paymentRef);
        if (doc.exists) {
          throw new Error('409 Duplicate: This Transaction ID has already been submitted.');
        }

        const paymentData = {
          userId: session.userId,
          plan,
          amount: parseFloat(amount),
          method,
          senderPhone,
          transactionId: transactionRef,
          smsConfirmation,
          screenshotUrl: screenshotUrl || null,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        transaction.set(paymentRef, paymentData);
      });
    } catch (err: any) {
      if (err.message.includes('409 Duplicate')) {
        return NextResponse.json({ error: err.message }, { status: 409 });
      }
      throw err;
    }

    // 2. Synchronize to SQLite/Prisma for administration fallback
    const payment = await prisma.payment.create({
      data: {
        userId: session.userId,
        plan: plan.toUpperCase(),
        amount: parseFloat(amount),
        method,
        senderPhone,
        transactionRef,
        smsConfirmation,
        screenshotUrl,
        status: 'PENDING',
      },
    });

    // Create Notification
    await prisma.notification.create({
      data: {
        userId: session.userId,
        title: 'Payment Pending Verification',
        content: `Your payment of ${amount} Birr via ${method} has been received and is currently Pending Verification. Our admin team will activate your ${plan.toLowerCase()} subscription shortly.`,
      },
    });

    // Log Activity
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'PAYMENT_SUBMIT',
        details: `Submitted payment of ${amount} Birr for ${plan} plan via ${method}`,
      },
    });

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      message: 'Payment details submitted successfully. Pending administrator verification.',
    });
  } catch (error: any) {
    console.error('Payment submission error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
