import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { createSession, verifyPassword } from '@/lib/auth';
import { jsonError, parseBody } from '@/lib/api-helpers';
import { rateLimit } from '@/lib/rate-limit';

const schema = z.object({ email: z.string().email().max(200), password: z.string().min(1).max(200) });

export async function POST(req: Request): Promise<NextResponse> {
  if (!rateLimit(req, 'login', 10, 60_000)) return jsonError('Zu viele Anmeldeversuche, bitte kurz warten.', 429);
  const body = await parseBody(req, schema);
  if (body instanceof NextResponse) return body;
  const db = getDb();
  const user = db.prepare('SELECT id, password_hash FROM users WHERE email = ?').get(body.email.toLowerCase()) as
    | { id: number; password_hash: string }
    | undefined;
  if (!user || !verifyPassword(body.password, user.password_hash)) {
    return jsonError('E-Mail oder Passwort falsch', 401);
  }
  await createSession(user.id);
  return NextResponse.json({ ok: true });
}
