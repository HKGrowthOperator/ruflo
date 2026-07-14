import { NextResponse } from 'next/server';
import { z } from 'zod';
import { currentUser, type SessionUser } from './auth';
import { hasFullAccess } from './services/entitlements';

export function jsonError(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/** Wird geworfen, wenn eine bezahlpflichtige Funktion ohne Zugang aufgerufen wird. */
export class PaymentRequiredError extends Error {
  constructor() {
    super('Zugang erforderlich');
    this.name = 'PaymentRequiredError';
  }
}

export async function withUser<T>(handler: (user: SessionUser) => Promise<T>): Promise<NextResponse> {
  const user = await currentUser();
  if (!user) return jsonError('Nicht angemeldet', 401);
  try {
    const data = await handler(user);
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof PaymentRequiredError) return jsonError(err.message, 402);
    const msg = (err as Error).message;
    console.error('[api]', msg);
    if (msg.includes('nicht gefunden')) return jsonError(msg, 404);
    if (msg.includes('Admins')) return jsonError(msg, 403);
    if (msg.includes('bereits abgegeben')) return jsonError(msg, 409);
    if (msg.includes('Onboarding fehlt')) return jsonError(msg, 409);
    return jsonError('Interner Fehler', 500);
  }
}

/** Wie withUser, wirft aber 402, wenn kein bezahlter Vollzugang besteht. */
export async function withPaidUser<T>(handler: (user: SessionUser) => Promise<T>): Promise<NextResponse> {
  return withUser(async (user) => {
    if (!hasFullAccess(user.id)) throw new PaymentRequiredError();
    return handler(user);
  });
}

export async function parseBody<S extends z.ZodTypeAny>(req: Request, schema: S): Promise<z.infer<S> | NextResponse> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return jsonError('Ungültiger JSON-Body');
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return jsonError(`Validierungsfehler: ${parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`);
  }
  return parsed.data;
}

export const zAnswerPayload = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('choice'), selected: z.array(z.string()).max(10) }),
  z.object({ kind: z.literal('number'), value: z.number().nullable(), unit: z.string().max(20) }),
  z.object({ kind: z.literal('ordering'), order: z.array(z.string().max(300)).max(20) }),
  z.object({ kind: z.literal('matching'), pairs: z.array(z.object({ left: z.string().max(300), right: z.string().max(300) })).max(20) }),
  z.object({ kind: z.literal('text'), text: z.string().max(8000) }),
]);
