import { prisma } from './prisma';

// Pricing values in USD
export const COST_PER_TEXT_TOKEN = 0.00000015; // $0.15 per million tokens
export const COST_PER_AUDIO_SECOND = 0.001;    // $0.06 per minute
export const COST_PER_LIVE_SECOND = 0.003;     // $0.18 per minute
export const COST_PER_SCAN = 0.002;            // $2.00 per 1000 scans

export interface QuotaCheckResult {
  allowed: boolean;
  reason?: string;
  code?: 'LIMIT_EXHAUSTED' | 'EXPIRED' | 'FORBIDDEN' | 'UNAUTHORIZED';
}

/**
 * Validates a user's quotas and returns whether they can make an AI request.
 */
export async function checkUserQuota(userId: string, actionType: 'text' | 'audio' | 'scan' | 'exam'): Promise<QuotaCheckResult> {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Fetch user, subscription, and today's usage logs
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscription: true,
    },
  });

  if (!user) {
    return { allowed: false, reason: 'User not found', code: 'UNAUTHORIZED' };
  }

  const sub = user.subscription;

  // If no subscription, or plan has expired
  if (!sub) {
    return { allowed: false, reason: 'No active subscription. Please upgrade to unlock learning.', code: 'LIMIT_EXHAUSTED' };
  }

  // 1. Check 30-Day Period Expiration
  if (sub.status === 'EXPIRED' || (sub.endDate && sub.endDate < now)) {
    // Passively downgrade if needed
    if (sub.plan !== 'FREEMIUM') {
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { plan: 'FREEMIUM', status: 'EXPIRED' },
      });
      await prisma.notification.create({
        data: {
          userId,
          title: 'Subscription Expired',
          content: 'Your regular/premium subscription has expired. Please renew to keep enjoying unlimited learning.',
        },
      });
    }
    return { allowed: false, reason: '403 Limit Exhausted: Your 30-day billing cycle has expired. Please renew your plan.', code: 'LIMIT_EXHAUSTED' };
  }

  const plan = sub.plan.toUpperCase();

  // 2. Feature Gating checks based on plan
  if (plan === 'FREEMIUM') {
    if (actionType === 'exam') {
      return { allowed: false, reason: 'Freemium plans do not have access to the Exam Dashboard. Please upgrade.', code: 'FORBIDDEN' };
    }
    if (actionType === 'audio') {
      return { allowed: false, reason: 'Freemium plans completely block multimedia audio operations. Please upgrade.', code: 'FORBIDDEN' };
    }
    if (actionType === 'scan') {
      return { allowed: false, reason: 'Freemium plans completely block notebook scan uploads. Please upgrade.', code: 'FORBIDDEN' };
    }
  }

  if (plan === 'REGULAR') {
    if (actionType === 'scan') {
      return { allowed: false, reason: 'Regular plans block notebook file uploads. Upgrade to Premium to scan notebooks.', code: 'FORBIDDEN' };
    }
  }

  // Find or create usage log for today
  let usage = await prisma.aIUsage.findFirst({
    where: { userId, date: todayStr },
  });

  if (!usage) {
    usage = await prisma.aIUsage.create({
      data: {
        userId,
        date: todayStr,
        messageCount: 0,
        textTokensToday: 0,
        audioSecondsToday: 0.0,
      },
    });
  }

  // 3. Quantitative Quota checks
  if (plan === 'FREEMIUM') {
    // Clamp chat to 5 messages per day
    if (usage.messageCount >= 5) {
      return { allowed: false, reason: '403 Limit Exhausted: Freemium daily chat limit of 5 messages reached. Reset at midnight.', code: 'LIMIT_EXHAUSTED' };
    }
  }

  if (plan === 'REGULAR') {
    // Budget limit check: Regular plan has $4.00 monthly budget limit
    const totalUSDSpent = await calculateBillingCycleSpend(userId, sub.startDate);
    if (totalUSDSpent >= 4.00) {
      return { allowed: false, reason: '403 Limit Exhausted: Regular plan monthly budget threshold ($4.00) reached.', code: 'LIMIT_EXHAUSTED' };
    }

    // Daily checks
    if (actionType === 'text') {
      // Limit to 106,000 text tokens daily
      if (usage.textTokensToday >= 106000) {
        return { allowed: false, reason: '403 Limit Exhausted: Regular plan daily text token quota (106k tokens) exhausted.', code: 'LIMIT_EXHAUSTED' };
      }
    }

    if (actionType === 'audio') {
      // Limit to 53 mins (3180 seconds) daily
      if (usage.audioSecondsToday >= 3180) {
        return { allowed: false, reason: '403 Limit Exhausted: Regular plan daily audio limit (53 mins) reached.', code: 'LIMIT_EXHAUSTED' };
      }
    }
  }

  if (plan === 'PREMIUM') {
    // Budget limit check: Premium plan has $27.78 monthly budget limit
    const totalUSDSpent = await calculateBillingCycleSpend(userId, sub.startDate);
    if (totalUSDSpent >= 27.78) {
      return { allowed: false, reason: '403 Limit Exhausted: Premium plan monthly budget threshold ($27.78) reached.', code: 'LIMIT_EXHAUSTED' };
    }

    // Daily checks
    if (actionType === 'audio') {
      // Premium uses a 2-Hour Rolling Buffer System
      const bufferSeconds = await calculateRollingBufferSeconds(userId, sub.startDate, sub.audioBufferSeconds);
      const totalAllowedToday = 7200 + bufferSeconds; // 2 hours base + rolling buffer
      
      if (usage.audioSecondsToday >= totalAllowedToday) {
        return { allowed: false, reason: `403 Limit Exhausted: Premium daily audio limit reached. Total allowed today (with buffer): ${Math.round(totalAllowedToday / 60)} mins.`, code: 'LIMIT_EXHAUSTED' };
      }
    }
  }

  return { allowed: true };
}

/**
 * Calculates cumulative USD spent in the current billing cycle.
 */
export async function calculateBillingCycleSpend(userId: string, cycleStartDate: Date): Promise<number> {
  const logs = await prisma.aIUsage.findMany({
    where: {
      userId,
      date: {
        gte: cycleStartDate.toISOString().split('T')[0],
      },
    },
  });

  let totalSpend = 0.0;
  
  logs.forEach((log) => {
    // Assume mixed voice and live streams. Estimate spend:
    const textSpend = log.textTokensToday * COST_PER_TEXT_TOKEN;
    const audioSpend = log.audioSecondsToday * COST_PER_AUDIO_SECOND;
    totalSpend += textSpend + audioSpend;
  });

  return totalSpend;
}

/**
 * Calculates current rolling buffer seconds for Premium users dynamically.
 * Formula: (days elapsed * 7200) - (past audio used in current cycle)
 */
export async function calculateRollingBufferSeconds(userId: string, cycleStartDate: Date, savedBufferPool: number): Promise<number> {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Calculate integer days elapsed
  const msElapsed = now.getTime() - cycleStartDate.getTime();
  const daysElapsed = Math.max(0, Math.floor(msElapsed / (1000 * 60 * 60 * 24)));

  if (daysElapsed === 0) {
    return savedBufferPool; // Starts with whatever base was written
  }

  // Get total audio seconds used in past days of the billing cycle
  const pastLogs = await prisma.aIUsage.findMany({
    where: {
      userId,
      date: {
        gte: cycleStartDate.toISOString().split('T')[0],
        lt: todayStr, // exclude today
      },
    },
  });

  const totalUsed = pastLogs.reduce((acc, log) => acc + log.audioSecondsToday, 0);
  const totalAllowedSoFar = daysElapsed * 7200; // 2 hours per day

  return Math.max(0, totalAllowedSoFar - totalUsed + savedBufferPool);
}

/**
 * Updates the database usage logs with consumed tokens/audio.
 */
export async function recordUsage(userId: string, textTokens: number, audioSeconds: number) {
  const todayStr = new Date().toISOString().split('T')[0];

  const usage = await prisma.aIUsage.findFirst({
    where: { userId, date: todayStr },
  });

  if (usage) {
    await prisma.aIUsage.update({
      where: { id: usage.id },
      data: {
        messageCount: { increment: 1 },
        textTokensToday: { increment: textTokens },
        audioSecondsToday: { increment: audioSeconds },
      },
    });
  } else {
    await prisma.aIUsage.create({
      data: {
        userId,
        date: todayStr,
        messageCount: 1,
        textTokensToday: textTokens,
        audioSecondsToday: audioSeconds,
      },
    });
  }
}
