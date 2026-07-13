import { NextResponse } from 'next/server';
import { z } from 'zod';
import { parseBody, withUser, zAnswerPayload } from '@/lib/api-helpers';
import { submitAttempt } from '@/lib/services/attempts';
import { markDiagnosed } from '@/lib/services/diagnosis';

const schema = z.object({
  questionId: z.string().max(60),
  context: z.enum(['diagnose', 'session', 'review']),
  answer: zAnswerPayload,
  helpLevel: z.number().int().min(0).max(5).default(0),
  confidence: z.enum(['geraten', 'eher_unsicher', 'teilweise_sicher', 'sicher', 'sehr_sicher']).nullable().default(null),
  timeTakenSeconds: z.number().int().min(0).max(7200).default(0),
  planItemId: z.number().int().optional(),
  /** letzter Diagnose-Versuch → Profil als diagnostiziert markieren */
  diagnosisComplete: z.boolean().default(false),
});

export async function POST(req: Request): Promise<NextResponse> {
  const body = await parseBody(req, schema);
  if (body instanceof NextResponse) return body;
  return withUser(async (user) => {
    const feedback = await submitAttempt({
      userId: user.id,
      questionId: body.questionId,
      context: body.context,
      answer: body.answer,
      helpLevel: body.helpLevel as 0 | 1 | 2 | 3 | 4 | 5,
      confidence: body.confidence,
      timeTakenSeconds: body.timeTakenSeconds,
      planItemId: body.planItemId,
    });
    if (body.diagnosisComplete) markDiagnosed(user.id);
    return feedback;
  });
}
