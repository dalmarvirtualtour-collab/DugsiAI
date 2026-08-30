import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { getTutorResponse } from '@/lib/gemini';
import { searchCurriculum } from '@/lib/search';

export async function POST(req: NextRequest) {
  try {
    const session = getSessionUser(req);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login.' },
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
        subscription: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const plan = user.subscription?.plan || 'FREEMIUM';

    // 1. Perform Platform-Wide Quota Check
    const { checkUserQuota } = await import('@/lib/quota');
    const quotaResult = await checkUserQuota(user.id, 'text');
    if (!quotaResult.allowed) {
      return NextResponse.json(
        {
          error: quotaResult.reason || "403 Limit Exhausted: Daily limit exceeded.",
          limitExhausted: true,
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { message, conversationId, subjectId, chapterId } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Resolve Context details
    let grade = user.student?.grade || 7;
    let schoolName = user.student?.school?.name || 'Local School';
    let region = user.region;
    let subjectName = 'General Studies';
    let chapterName = 'General Context';

    if (subjectId) {
      const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
      if (subject) subjectName = subject.name;
    }
    if (chapterId) {
      const chapter = await prisma.chapter.findUnique({ where: { id: chapterId } });
      if (chapter) chapterName = chapter.name;
    }

    // Resolve or create Conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.aIConversation.findUnique({
        where: { id: conversationId },
      });
    }

    if (!conversation) {
      const shortTitle = message.substring(0, 40) + (message.length > 40 ? '...' : '');
      conversation = await prisma.aIConversation.create({
        data: {
          userId: user.id,
          subjectId,
          chapterId,
          title: shortTitle,
        },
      });
    }

    // Fetch conversation history
    const pastMessages = await prisma.aIMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
      take: 10,
    });

    const formattedHistory = pastMessages.map((m) => ({
      role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
      text: m.text,
    }));

    // Search the curriculum database for relevant lesson content
    const searchResults = await searchCurriculum({
      query: message,
      grade,
      subjectId
    });

    let textbookContext = '';
    if (searchResults && searchResults.length > 0) {
      const topMatch = searchResults[0];
      textbookContext = `RELEVANT TEXTBOOK LESSON: "${topMatch.title}" (from Unit: ${topMatch.chapter.name})\nContent:\n${topMatch.content}`;
    }

    // Generate response from AI service
    const aiResponseText = await getTutorResponse({
      studentName: user.name,
      grade,
      school: schoolName,
      region,
      language: user.preferredLanguage,
      subscriptionPlan: plan,
      subjectName,
      chapterName,
      message,
      history: formattedHistory,
      textbookContext,
    });

    // Inject YouTube redirects into science and math concepts
    const { injectYouTubeRedirectLinks } = await import('@/lib/youtube');
    const finalResponseText = injectYouTubeRedirectLinks(aiResponseText, subjectName);

    // Save messages in database
    await prisma.$transaction([
      prisma.aIMessage.create({
        data: {
          conversationId: conversation.id,
          sender: 'user',
          text: message,
        },
      }),
      prisma.aIMessage.create({
        data: {
          conversationId: conversation.id,
          sender: 'ai',
          text: finalResponseText,
        },
      }),
    ]);

    // Record token usage
    const inputTokens = Math.ceil(message.length / 4);
    const outputTokens = Math.ceil(finalResponseText.length / 4);
    const totalTokens = inputTokens + outputTokens;

    const { recordUsage } = await import('@/lib/quota');
    await recordUsage(user.id, totalTokens, 0);

    const todayStr = new Date().toISOString().split('T')[0];
    const updatedUsage = await prisma.aIUsage.findFirst({
      where: { userId: user.id, date: todayStr },
    });
    const updatedMessageCount = updatedUsage ? updatedUsage.messageCount : 1;

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
      response: finalResponseText,
      usage: {
        messagesToday: updatedMessageCount,
        freeMessagesLeft: Math.max(0, 5 - updatedMessageCount),
      },
    });
  } catch (error: any) {
    console.error('AI chat error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
