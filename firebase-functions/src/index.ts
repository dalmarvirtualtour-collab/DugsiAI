import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Background Cloud Function listener triggered when a payment document is updated.
 * If status changes to 'verified', updates user roles and sets active 30-day limits.
 */
export const onPaymentVerificationChange = onDocumentUpdated('payments/{paymentId}', async (event) => {
  const beforeData = event.data?.before.data();
  const afterData = event.data?.after.data();

  if (!beforeData || !afterData) {
    console.warn('Document data missing, skipping transaction sync.');
    return;
  }

  // Check if status transitioned to verified
  const wasPending = beforeData.status === 'pending' || beforeData.status === 'PENDING';
  const isVerified = afterData.status === 'verified' || afterData.status === 'VERIFIED' || afterData.status === 'APPROVED';

  if (wasPending && isVerified) {
    const userId = afterData.userId;
    const plan = (afterData.plan || 'REGULAR').toUpperCase(); // REGULAR or PREMIUM
    
    console.log(`Payment verified for User: ${userId}. Upgrading to plan: ${plan}`);

    try {
      const now = new Date();
      const expiryDate = new Date();
      expiryDate.setDate(now.getDate() + 30); // 30-Day Expiration Timestamp

      await prisma.$transaction(async (tx) => {
        // 1. Update Student's profile role
        await tx.user.update({
          where: { id: userId },
          data: {
            role: plan.toLowerCase(), // role set to "regular" or "premium"
          },
        });

        // 2. Set active 30-day subscription
        const existingSub = await tx.subscription.findUnique({
          where: { userId },
        });

        if (existingSub) {
          await tx.subscription.update({
            where: { id: existingSub.id },
            data: {
              plan,
              startDate: now,
              endDate: expiryDate,
              status: 'ACTIVE',
              audioBufferSeconds: 0.0, // reset rolling audio buffer to fresh base
              totalSpendUSD: 0.0,
            },
          });
        } else {
          await tx.subscription.create({
            data: {
              userId,
              plan,
              startDate: now,
              endDate: expiryDate,
              status: 'ACTIVE',
              audioBufferSeconds: 0.0,
              totalSpendUSD: 0.0,
            },
          });
        }

        // 3. Complete wipe of daily throttling counts for immediate utility
        const todayStr = now.toISOString().split('T')[0];
        const usage = await tx.aIUsage.findFirst({
          where: { userId, date: todayStr },
        });

        if (usage) {
          await tx.aIUsage.update({
            where: { id: usage.id },
            data: {
              messageCount: 0,
              textTokensToday: 0,
              audioSecondsToday: 0.0,
            },
          });
        }

        // 4. Create Activation Notification
        await tx.notification.create({
          data: {
            userId,
            title: 'DugsiAI Subscription Activated!',
            content: `Your payment has been manually verified. Your ${plan.toLowerCase()} plan is now active for the next 30 days. Daily throttles have been wiped. Happy studying!`,
          },
        });

        // 5. Log auditing trace
        await tx.auditLog.create({
          data: {
            userId,
            action: 'CLOUDFUNC_PAYMENT_ACTIVATION',
            details: `Manually verified payment ID: ${event.params.paymentId}. Subscribed user to ${plan} for 30 days.`,
          },
        });
      });

      console.log(`Successfully completed user subscription activation flow for user ${userId}`);
    } catch (error) {
      console.error('Error executing database upgrade in Cloud Function:', error);
    }
  } else {
    console.log('Document status change did not match pending -> verified transition.');
  }
});
