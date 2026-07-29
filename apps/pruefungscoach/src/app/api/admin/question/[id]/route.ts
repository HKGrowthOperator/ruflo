import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { jsonError, parseBody, withUser } from '@/lib/api-helpers';
import { CONTENT_STATUSES } from '@/lib/domain/types';

const schema = z.object({
  prompt: z.string().min(10).optional(),
  context: z.string().nullable().optional(),
  model_answer: z.string().min(5).optional(),
  status: z.enum(CONTENT_STATUSES).optional(),
  difficulty: z.number().int().min(1).max(5).optional(),
  exam_relevance: z.number().int().min(1).max(5).optional(),
  points: z.number().min(1).max(20).optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const { id } = await ctx.params;
  const body = await parseBody(req, schema);
  if (body instanceof NextResponse) return body;
  return withUser(async (user) => {
    if (user.role !== 'admin') throw new Error('Nur für Admins');
    const db = getDb();
    const existing = db.prepare('SELECT id, version FROM questions WHERE id = ?').get(id) as { id: string; version: number } | undefined;
    if (!existing) throw new Error('Frage nicht gefunden');

    const fields = Object.entries(body).filter(([, v]) => v !== undefined);
    if (fields.length === 0) return { ok: true };
    const setClause = fields.map(([k]) => `${k} = ?`).join(', ');
    const values = fields.map(([, v]) => v);
    db.prepare(`UPDATE questions SET ${setClause}, version = version + 1 WHERE id = ?`).run(...values, id);
    return { ok: true, version: existing.version + 1 };
  });
}
