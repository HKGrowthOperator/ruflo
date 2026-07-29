import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { parseBody, withUser, zAnswerPayload } from '@/lib/api-helpers';
import { saveSimAnswer } from '@/lib/services/simulations';

const schema = z.object({
  questionId: z.string().max(60),
  answer: zAnswerPayload,
  flagged: z.boolean().default(false),
});

/** Autosave während der Simulation (§20) — keine Bewertung vor Abgabe. */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const { id } = await ctx.params;
  const body = await parseBody(req, schema);
  if (body instanceof NextResponse) return body;
  return withUser(async (user) => {
    const db = getDb();
    const sim = db.prepare('SELECT id, submitted_at FROM simulations WHERE id = ? AND user_id = ?').get(Number(id), user.id) as
      | { id: number; submitted_at: string | null }
      | undefined;
    if (!sim) throw new Error('Simulation nicht gefunden');
    if (sim.submitted_at) throw new Error('Simulation bereits abgegeben');
    saveSimAnswer(sim.id, body.questionId, body.answer, body.flagged);
    return { ok: true };
  });
}
