import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getDb } from '@/lib/db';
import { verifyWebhook } from '@/lib/payments/stripe';
import { grantPaid } from '@/lib/services/entitlements';

/**
 * Stripe-Webhook: schaltet nach erfolgreicher Zahlung den Vollzugang frei.
 * Muss die rohe Body-Bytes lesen (Signaturprüfung) — daher kein JSON-Parsing.
 */
export async function POST(req: Request): Promise<NextResponse> {
  const sig = req.headers.get('stripe-signature');
  if (!sig) return NextResponse.json({ error: 'Signatur fehlt' }, { status: 400 });

  let event: Stripe.Event;
  try {
    const raw = await req.text();
    event = verifyWebhook(raw, sig);
  } catch (err) {
    console.error('[stripe] Webhook-Verifikation fehlgeschlagen:', (err as Error).message);
    return NextResponse.json({ error: 'Ungültige Signatur' }, { status: 400 });
  }

  const db = getDb();
  // Idempotenz: jedes Event nur einmal verarbeiten
  const already = db.prepare('SELECT id FROM stripe_events WHERE id = ?').get(event.id);
  if (already) return NextResponse.json({ received: true, duplicate: true });
  db.prepare('INSERT INTO stripe_events (id, type) VALUES (?, ?)').run(event.id, event.type);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = Number(session.metadata?.userId ?? session.client_reference_id);
    if (userId && session.payment_status === 'paid') {
      grantPaid(userId, {
        source: 'purchase',
        stripeCustomerId: typeof session.customer === 'string' ? session.customer : undefined,
        checkoutSession: session.id,
      });
    }
  }

  return NextResponse.json({ received: true });
}
