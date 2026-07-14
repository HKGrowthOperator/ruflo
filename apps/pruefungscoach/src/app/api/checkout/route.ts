import { NextResponse } from 'next/server';
import { jsonError, withUser } from '@/lib/api-helpers';
import { paymentsEnabled } from '@/lib/config';
import { createCheckoutSession } from '@/lib/payments/stripe';
import { stripeCustomerFor } from '@/lib/services/entitlements';

/** Startet den Stripe-Checkout und liefert die Weiterleitungs-URL. */
export async function POST(): Promise<NextResponse> {
  if (!paymentsEnabled()) return jsonError('Bezahlung ist derzeit nicht aktiviert.', 400);
  return withUser(async (user) => {
    const url = await createCheckoutSession({
      userId: user.id,
      email: user.email,
      existingCustomerId: stripeCustomerFor(user.id),
    });
    return { url };
  });
}
