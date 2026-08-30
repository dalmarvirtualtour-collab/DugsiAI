import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
let genAI: GoogleGenerativeAI | null = null;

if (apiKey) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
  } catch (error) {
    console.error('Failed to initialize Google Generative AI client:', error);
  }
}

export interface AIChatParams {
  studentName: string;
  grade: number;
  school: string;
  region: string;
  language: string;
  subscriptionPlan: string;
  subjectName?: string;
  chapterName?: string;
  message: string;
  history: { role: 'user' | 'model'; text: string }[];
  textbookContext?: string;
}

export async function getTutorResponse(params: AIChatParams): Promise<string> {
  const {
    studentName,
    grade,
    school,
    region,
    language,
    subscriptionPlan,
    subjectName = 'General',
    chapterName = 'General',
    message,
    history,
    textbookContext,
  } = params;

  let groundingInstruction = '';
  if (textbookContext) {
    groundingInstruction = `
    THE FOLLOWING OFFICIAL TEXTBOOK LESSON CONTENT WAS RETRIEVED FROM THE CURRICULUM DATABASE:
    ---
    ${textbookContext}
    ---
    YOU MUST GROUND YOUR RESPONSE DIRECTLY IN THE RETRIEVED LESSON CONTENT ABOVE. Prioritize this information above general knowledge.
    `;
  } else {
    groundingInstruction = `
    NO DIRECT TEXTBOOK LESSON CONTENT WAS FOUND FOR THIS QUESTION. 
    Use your general knowledge but clearly state that you are grounding your response in the Ethiopian Grade ${grade} curriculum context.
    `;
  }

  const systemInstruction = `You are MacalinAI, the educational AI tutor for DugsiAI, an interactive learning platform. 
  Your student is named "${studentName}", who is in Grade ${grade} at "${school}" in the "${region}" region of Ethiopia.
  The student's preferred language is "${language}" (which could be Af-Soomaali, Amharic, Afan Oromo, or English).
  Their subscription level is "${subscriptionPlan}".
  The learning context is Grade ${grade} ${subjectName}, specifically the unit/chapter: "${chapterName}".
  
  ${groundingInstruction}
  
  CRITICAL RULES:
  1. Your responses MUST align strictly with the official Federal Democratic Republic of Ethiopia Ministry of Education Curriculum guidelines for Grade ${grade}.
  2. Maintain a friendly, supportive, and engaging educational tone. Explain complex scientific, mathematical, or historical concepts step-by-step.
  3. If they ask about equations or formulas, write them out clearly and explain the variables.
  4. Break down the language barrier! Explain technical terms in clear English, but provide translations, definitions, or supporting context in the student's preferred language ("${language}") when helpful.
  5. Never give direct answers to homework questions immediately. Instead, lead the student to the answer with hints and concept summaries to build their conceptual understanding.
  6. Do not include placeholders or generic content.
  7. ZERO-OVERHEAD YOUTUBE REDIRECTION: Whenever explaining a scientific or mathematical concept, process, or equation, append a YouTube search tag at the end of the text in the format: [YOUTUBE_SEARCH: Exact Topic Name For Demonstration]. Select high-level, clear search topics.
  8. INTENT ALIGNMENT LAYER: If the student's message is vague (e.g. 'i don't get unit 3 math' or 'help with chemistry formulas'), look up their syllabus position. Proactively suggest a step-by-step diagnostic breakdown of that specific unit.
  `;

  if (genAI) {
    try {
      let modelName = 'gemini-3.1-flash-lite';
      if (subscriptionPlan.toUpperCase() === 'PREMIUM') {
        modelName = 'gemini-3.1-flash-live-preview';
      }
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction,
      });

      const contents = history.map((h) => ({
        role: h.role,
        parts: [{ text: h.text }],
      }));

      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const result = await model.generateContent({ contents });
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API call failed, falling back to rule-based engine:', error);
    }
  }

  return getFallbackEducationalResponse(message, params);
}

function getFallbackEducationalResponse(message: string, params: AIChatParams): string {
  const { studentName, grade, language, subjectName, chapterName } = params;
  const lower = message.toLowerCase();

  let greet = "Hello! ";
  if (language === 'so') greet = "Nabad iyo caano! ";
  else if (language === 'am') greet = "ሰላም! ";
  else if (language === 'om') greet = "Akkam! ";

  let responseText = `${greet}I am MacalinAI, your study companion. Currently, our AI services are operating in local offline simulation mode. Let's analyze your question about "${subjectName}" - Chapter: "${chapterName}".\n\n`;

  if (lower.includes('chemistry') || lower.includes('reaction') || lower.includes('collision')) {
    responseText += `Under Grade 11 Chemistry Unit 3 (Collision Theory), for chemical reactions to occur, two conditions must be satisfied:
1. **Sufficient Kinetic Energy:** Particles must collide with energy greater than or equal to the Activation Energy ($E_a$).
2. **Proper Orientation:** Molecules must align perfectly at the moment of impact.
Increasing the temperature elevates the average kinetic energy of the particles, leading to a higher frequency of effective collisions.`;
  } else if (lower.includes('matrix') || lower.includes('matrices') || lower.includes('determinant')) {
    responseText += `In Grade 11 Mathematics Unit 2, for a 2x2 matrix $A = \\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}$, the determinant is:
$$\\det(A) = ad - bc$$
If $\\det(A) = 0$, the matrix is singular and does not have an inverse. Otherwise, the inverse is $A^{-1} = \\frac{1}{\\det(A)} \\begin{bmatrix} d & -b \\\\ -c & a \\end{bmatrix}$.`;
  } else if (lower.includes('gravity') || lower.includes('gravitation') || lower.includes('newton')) {
    responseText += `In Grade 11 Physics Unit 4, Newton's Law of Universal Gravitation states that every particle attracts every other particle in the universe with a force proportional to the product of their masses and inversely proportional to the square of the distance between them:
$$F = G \\frac{m_1 m_2}{r^2}$$
Where $G \\approx 6.674 \\times 10^{-11} \\text{ N m}^2/\\text{kg}^2$ is the gravitational constant.`;
  } else if (lower.includes('cell') || lower.includes('biology') || lower.includes('membrane')) {
    responseText += `Under Grade 9 Biology Unit 1, we cover cell structure. Plant cells contain a rigid cell wall made of cellulose, chloroplasts for photosynthesis, and a large central vacuole. Animal cells lack cell walls and chloroplasts but have lysosomes and centrioles. Both cells share a semi-permeable cell membrane that regulates substance transport.`;
  } else if (lower.includes('esslce') || lower.includes('exam') || lower.includes('matric')) {
    responseText += `I have index matching for thousands of ESSLCE national exam questions. Let's practice a multiple-choice question. What subject are you focusing on right now? (e.g. Physics, Chemistry, Biology, or Mathematics)`;
  } else {
    responseText += `Based on the Grade ${grade} curriculum for ${subjectName}, let's examine this conceptually. If you are preparing for classroom assessments or national examinations, remember that studying the textbook definitions and attempting chapter reviews is the key to success. Would you like me to construct a multiple-choice practice question for this unit?`;
  }

  if (language === 'so') {
    responseText += `\n\nWaxaan halkan u joogaa inaan ku caawiyo, ${studentName}! Ma haysaa su'aalo kale?`;
  } else if (language === 'am') {
    responseText += `\n\nእኔ እርስዎን ለመርዳት እዚህ ነኝ፣ ${studentName}! ሌላ ጥያቄ አለዎት?`;
  } else if (language === 'om') {
    responseText += `\n\nSiraata barnootaaf si gargaaruun as jira, ${studentName}! Gaaffii biraa qabdaa?`;
  } else {
    responseText += `\n\nI am here to help you build conceptual understanding, ${studentName}! Do you have any further questions?`;
  }

  return responseText;
}
