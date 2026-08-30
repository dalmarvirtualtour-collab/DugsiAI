import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
let genAI: GoogleGenerativeAI | null = null;
if (apiKey) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
  } catch (error) {
    console.error('Failed to initialize Gemini client for lab tutor:', error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { student: { include: { school: true } }, subscription: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Perform Platform-Wide Quota Check
    const { checkUserQuota, recordUsage } = await import('@/lib/quota');
    const quotaResult = await checkUserQuota(user.id, 'text');
    if (!quotaResult.allowed) {
      return NextResponse.json(
        { error: quotaResult.reason || "Daily limit exceeded.", limitExhausted: true },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { labId, title, subject, grade, liveParameters, message, history } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const studentName = user.name;
    const schoolName = user.student?.school?.name || 'Local School';
    const region = user.region;
    const preferredLanguage = user.preferredLanguage || 'en';
    const plan = user.subscription?.plan || 'FREEMIUM';

    // Build grounding instruction for the specific lab
    const systemInstruction = `You are MacalinAI, the educational AI tutor for DugsiAI's Virtual Lab.
Your student is "${studentName}", in Grade ${grade} at "${schoolName}" in the "${region}" region of Ethiopia.
Their preferred language is "${preferredLanguage}" (which could be English "en", Somali "so", Amharic "am", or Oromo "om").
Their subscription level is "${plan}".

They are currently inside the interactive simulation: "${title}" (${subject.toUpperCase()}, Grade ${grade}).
CURRENT SIMULATION STATE (Live Parameters):
${JSON.stringify(liveParameters, null, 2)}

CRITICAL RULES:
1. Explain the scientific, geographic, or mathematical principles at play. Ground explanations in the official Ethiopian curriculum.
2. Refer to the student's current parameters and calculated values (e.g., fluid densities, heart chambers, quadratic coefficients, contour elevation) to show how variables affect results.
3. Be a Socratic tutor! Do not give direct answers immediately. Lead the student to the answer with hints, conceptual explanations, and questions.
4. Maintain a supportive, engaging tone. Translate technical terms or provide supporting text in "${preferredLanguage}" when helpful.
5. Append a YouTube search tag at the end in the format: [YOUTUBE_SEARCH: Exact Topic Name] to help them find demonstrations.
`;

    let reply = '';
    if (genAI) {
      const modelName = plan.toUpperCase() === 'PREMIUM' ? 'gemini-3.1-flash-live-preview' : 'gemini-3.1-flash-lite';
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction
      });

      const contents = history.map((h: any) => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }]
      }));

      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const result = await model.generateContent({ contents });
      const responseText = await result.response;
      reply = responseText.text();
    } else {
      // Fallback local rule-based response
      reply = `Hello, ${studentName}! I am currently running in offline lab mode. Let's analyze your parameters.
For your simulation "${title}" in ${subject}, your current variables are: ${JSON.stringify(liveParameters)}. 
What happens when you adjust these settings? Try decreasing or increasing them to see the changes.`;
    }

    // Inject YouTube redirects into reply
    const { injectYouTubeRedirectLinks } = await import('@/lib/youtube');
    const finalReply = injectYouTubeRedirectLinks(reply, subject);

    // Save message logs in AIConversation if applicable
    let conversation = await prisma.aIConversation.findFirst({
      where: { userId: user.id, title: `Lab: ${title}` }
    });
    if (!conversation) {
      conversation = await prisma.aIConversation.create({
        data: {
          userId: user.id,
          title: `Lab: ${title}`,
          subjectId: `${grade}-${subject}`
        }
      });
    }

    await prisma.$transaction([
      prisma.aIMessage.create({
        data: { conversationId: conversation.id, sender: 'user', text: message }
      }),
      prisma.aIMessage.create({
        data: { conversationId: conversation.id, sender: 'ai', text: finalReply }
      })
    ]);

    // Record token usage
    const tokens = Math.ceil((message.length + finalReply.length) / 4);
    await recordUsage(user.id, tokens, 0);

    return NextResponse.json({
      success: true,
      response: finalReply
    });
  } catch (error: any) {
    console.error('Lab AI chat error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
