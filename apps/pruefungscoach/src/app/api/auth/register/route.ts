import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { createSession, hashPassword } from '@/lib/auth';
import { jsonError, parseBody } from '@/lib/api-helpers';
import { rateLimit } from '@/lib/rate-limit';
import { ensureEntitlement } from '@/lib/services/entitlements';

const schema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(8).max(200),
  displayName: z.string().min(1).max(100),
});

export async function POST(req: Request): Promise<NextResponse> {
  if (!rateLimit(req, 'register', 5, 60_000)) return jsonError('Zu viele Registrierungen, bitte kurz warten.', 429);
  const body = await parseBody(req, schema);
  if (body instanceof NextResponse) return body;
  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(body.email.toLowerCase());
  if (existing) return jsonError('E-Mail bereits registriert', 409);
  const res = db
    .prepare("INSERT INTO users (email, password_hash, display_name, role) VALUES (?, ?, ?, 'learner')")
    .run(body.email.toLowerCase(), hashPassword(body.password), body.displayName);
  const userId = Number(res.lastInsertRowid);
  ensureEntitlement(userId);
  await createSession(userId);
  return NextResponse.json({ ok: true });
}
