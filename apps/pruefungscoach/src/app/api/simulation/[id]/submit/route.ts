import { NextResponse } from 'next/server';
import { withUser } from '@/lib/api-helpers';
import { submitSimulation } from '@/lib/services/simulations';

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const { id } = await ctx.params;
  return withUser(async (user) => submitSimulation(user.id, Number(id)));
}
