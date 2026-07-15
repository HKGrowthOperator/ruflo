import { NextResponse, type NextRequest } from 'next/server';
import { runRadar } from '@tnr/ingestion';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Cron-Endpoint (Frage 17): Vercel Cron ruft ihn alle 30 Minuten auf
 * (siehe vercel.json) und sendet "Authorization: Bearer <CRON_SECRET>".
 * Lokal: curl "http://localhost:3000/api/cron/radar?secret=<CRON_SECRET>"
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get('authorization');
    const query = request.nextUrl.searchParams.get('secret');
    if (auth !== `Bearer ${secret}` && query !== secret) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  }
  const report = await runRadar('cron');
  return NextResponse.json(report);
}
