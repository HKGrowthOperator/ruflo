import { NextResponse } from 'next/server';
import { z } from 'zod';
import { jsonError, parseBody } from '@/lib/api-helpers';
import { rateLimit } from '@/lib/rate-limit';
import { consumeReset } from '@/lib/services/passwordReset';

const schema = z.object({ token: z.string().min(10).max(200), password: z.string().min(8).max(200) });

export async function POST(req: Request): Promise<NextResponse> {
  if (!rateLimit(req, 'reset', 10, 60_000)) return jsonError('Zu viele Anfragen.', 429);
  const body = await parseBody(req, schema);
  if (body instanceof NextResponse) return body;
  const result = consumeReset(body.token, body.password);
  if (!result.ok) return jsonError(result.error ?? 'Zurücksetzen fehlgeschlagen', 400);
  return NextResponse.json({ ok: true });
}
