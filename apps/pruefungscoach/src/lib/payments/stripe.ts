/**
 * Stripe-Anbindung (Einmalkauf "Vollzugang bis zur Prüfung").
 * Aktiv nur mit STRIPE_SECRET_KEY + STRIPE_PRICE_ID. Ohne diese Variablen
 * bleibt der Kauf deaktiviert und die App läuft im Free-Live-Modus.
 */
import Stripe from 'stripe';
import { baseUrl } from '../config';

let client: Stripe | null = null;

export function stripe(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY fehlt');
    client = new Stripe(key, { apiVersion: '2025-01-27.acacia' as Stripe.LatestApiVersion });
  }
  return client;
}

export async function createCheckoutSession(opts: {
  userId: number;
  email: string;
  existingCustomerId?: string | null;
}): Promise<string> {
  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) throw new Error('STRIPE_PRICE_ID fehlt');
  const session = await stripe().checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: priceId, quantity: 1 }],
    customer: opts.existingCustomerId || undefined,
    customer_email: opts.existingCustomerId ? undefined : opts.email,
    client_reference_id: String(opts.userId),
    metadata: { userId: String(opts.userId) },
    success_url: `${baseUrl()}/kauf-erfolg?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl()}/preise?abgebrochen=1`,
    allow_promotion_codes: true,
  });
  if (!session.url) throw new Error('Stripe lieferte keine Checkout-URL');
  return session.url;
}

/** Verifiziert und parst ein Webhook-Event. */
export function verifyWebhook(rawBody: string, signature: string): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET fehlt');
  return stripe().webhooks.constructEvent(rawBody, signature, secret);
}
