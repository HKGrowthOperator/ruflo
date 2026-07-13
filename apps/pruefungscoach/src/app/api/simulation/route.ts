import { NextResponse } from 'next/server';
import { z } from 'zod';
import { parseBody, withUser } from '@/lib/api-helpers';
import { createSimulation } from '@/lib/services/simulations';

const schema = z.object({ kind: z.enum(['mini', 'teil', 'voll', 'belastung']) });

export async function POST(req: Request): Promise<NextResponse> {
  const body = await parseBody(req, schema);
  if (body instanceof NextResponse) return body;
  return withUser(async (user) => {
    const simId = createSimulation(user.id, body.kind);
    return { simId };
  });
}
