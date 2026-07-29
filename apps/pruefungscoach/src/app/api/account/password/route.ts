import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { currentUser, hashPassword, verifyPassword } from '@/lib/auth';
import { jsonError, parseBody } from '@/lib/api-helpers';

const schema = z.object({ currentPassword: z.string().min(1).max(200), newPassword: z.string().min(8).max(200) });

export async function POST(req: Request): Promise<NextResponse> {
  const user = await currentUser();
  if (!user) return jsonError('Nicht angemeldet', 401);
  const body = await parseBody(req, schema);
  if (body instanceof NextResponse) return body;
  const db = getDb();
  const row = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(user.id) as { password_hash: string };
  if (!verifyPassword(body.currentPassword, row.password_hash)) {
    return jsonError('Aktuelles Passwort ist falsch', 400);
  }
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(body.newPassword), user.id);
  return NextResponse.json({ ok: true });
}
