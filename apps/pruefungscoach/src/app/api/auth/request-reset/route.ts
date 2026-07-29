import { NextResponse } from 'next/server';
import { z } from 'zod';
import { jsonError, parseBody } from '@/lib/api-helpers';
import { rateLimit } from '@/lib/rate-limit';
import { requestReset } from '@/lib/services/passwordReset';

const schema = z.object({ email: z.string().email().max(200) });

export async function POST(req: Request): Promise<NextResponse> {
  if (!rateLimit(req, 'request-reset', 5, 60_000)) return jsonError('Zu viele Anfragen, bitte später erneut versuchen.', 429);
  const body = await parseBody(req, schema);
  if (body instanceof NextResponse) return body;
  const result = await requestReset(body.email);
  return NextResponse.json(result);
}
