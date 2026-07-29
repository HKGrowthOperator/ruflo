import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { withUser } from '@/lib/api-helpers';
import { loadQuestion, toPublicQuestion } from '@/lib/services/questions';

/** Simulationszustand: Fragen (ohne Lösungen), Antworten, Restzeit. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const { id } = await ctx.params;
  return withUser(async (user) => {
    const db = getDb();
    const sim = db.prepare('SELECT * FROM simulations WHERE id = ? AND user_id = ?').get(Number(id), user.id) as
      | { id: number; kind: string; time_limit_s: number; started_at: string; submitted_at: string | null }
      | undefined;
    if (!sim) throw new Error('Simulation nicht gefunden');
    const items = db
      .prepare('SELECT question_id, position, answer_json, flagged FROM simulation_items WHERE sim_id = ? ORDER BY position')
      .all(sim.id) as { question_id: string; position: number; answer_json: string | null; flagged: number }[];

    const startedMs = new Date(`${sim.started_at.replace(' ', 'T')}Z`).getTime();
    const remainingS = Math.max(0, sim.time_limit_s - Math.round((Date.now() - startedMs) / 1000));

    return {
      simId: sim.id,
      kind: sim.kind,
      submitted: Boolean(sim.submitted_at),
      timeLimitS: sim.time_limit_s,
      remainingS,
      items: items.map((it) => {
        const q = loadQuestion(it.question_id);
        return {
          position: it.position,
          flagged: it.flagged === 1,
          answered: it.answer_json !== null,
          answer: it.answer_json ? JSON.parse(it.answer_json) : null,
          question: q ? toPublicQuestion(q) : null,
        };
      }),
    };
  });
}
