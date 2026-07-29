import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { parseBody, PaymentRequiredError, withUser, zAnswerPayload } from '@/lib/api-helpers';
import { submitAttempt } from '@/lib/services/attempts';
import { isDiagnosed, markDiagnosed } from '@/lib/services/diagnosis';
import { hasFullAccess } from '@/lib/services/entitlements';

/** Obergrenze an Gratis-Diagnoseversuchen (Diagnose umfasst ~28 Aufgaben). */
const FREE_DIAGNOSE_ATTEMPT_LIMIT = 60;

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
    // Diagnose ist Teil des kostenlosen Probierteils; Lernsessions sind bezahlpflichtig.
    if (!hasFullAccess(user.id)) {
      if (body.context !== 'diagnose') throw new PaymentRequiredError();
      // Ohne Vollzugang gilt der Diagnose-Kontext nur für die eigentliche
      // Eingangsdiagnose: danach (und über einem Versuchslimit) wäre er sonst
      // ein Bypass, um den ganzen Fragenpool inkl. Musterlösungen abzugrasen.
      if (isDiagnosed(user.id)) throw new PaymentRequiredError();
      const attempts = (
        getDb()
          .prepare("SELECT COUNT(*) n FROM attempts WHERE user_id = ? AND context = 'diagnose'")
          .get(user.id) as { n: number }
      ).n;
      if (attempts >= FREE_DIAGNOSE_ATTEMPT_LIMIT) throw new PaymentRequiredError();
    }
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
