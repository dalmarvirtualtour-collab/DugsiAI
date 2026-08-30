export interface ReadingTelemetry {
  chapterId: string;
  secondsActive: number;
  scrollSpeed: number; // velocity
  clicks: number;
}

export interface QuestionTelemetry {
  questionId: string;
  latencySeconds: number;
  isCorrect: boolean;
  errorTag?: 'CONCEPT_MISUNDERSTANDING' | 'VOCABULARY_GAP' | null;
}

export interface AttendanceTelemetry {
  userId: string;
}

export async function sendTelemetry(type: 'attendance' | 'reading' | 'diagnostic', data: any) {
  try {
    const res = await fetch('/api/telemetry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, ...data }),
    });
    if (!res.ok) {
      console.warn('Failed to send telemetry update', res.statusText);
    }
  } catch (error) {
    console.error('Error sending telemetry batch:', error);
  }
}
