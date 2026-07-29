import { getDb } from '../db';
import { paymentsEnabled } from '../config';
import { purchaseAccessUntil, resolveAccess, type Entitlement, type AccessResult } from '../domain/entitlements';

interface EntitlementRow {
  plan: 'free' | 'paid';
  access_until: string | null;
  source: string;
  stripe_customer_id: string | null;
}

export function getEntitlement(userId: number): Entitlement | null {
  const row = getDb().prepare('SELECT plan, access_until FROM entitlements WHERE user_id = ?').get(userId) as
    | { plan: 'free' | 'paid'; access_until: string | null }
    | undefined;
  return row ? { plan: row.plan, accessUntil: row.access_until } : null;
}

/** Legt bei Bedarf einen Free-Eintrag an (idempotent). */
export function ensureEntitlement(userId: number): void {
  getDb()
    .prepare(`INSERT INTO entitlements (user_id, plan, source) VALUES (?, 'free', 'trial') ON CONFLICT(user_id) DO NOTHING`)
    .run(userId);
}

export function accessFor(userId: number, now: Date = new Date()): AccessResult {
  return resolveAccess({ paymentsEnabled: paymentsEnabled(), entitlement: getEntitlement(userId), now });
}

export function hasFullAccess(userId: number, now: Date = new Date()): boolean {
  return accessFor(userId, now).hasFullAccess;
}

/** Setzt bezahlten Zugang (nach Stripe-Kauf oder durch Admin). */
export function grantPaid(
  userId: number,
  opts: { source: 'purchase' | 'admin'; stripeCustomerId?: string; checkoutSession?: string; now?: Date },
): void {
  const db = getDb();
  const now = opts.now ?? new Date();
  const profile = db.prepare('SELECT exam_date FROM learner_profiles WHERE user_id = ?').get(userId) as
    | { exam_date: string }
    | undefined;
  const accessUntil = purchaseAccessUntil(profile?.exam_date ?? null, now);
  db.prepare(`
    INSERT INTO entitlements (user_id, plan, access_until, source, stripe_customer_id, stripe_checkout_session, granted_at, updated_at)
    VALUES (?, 'paid', ?, ?, ?, ?, datetime('now'), datetime('now'))
    ON CONFLICT(user_id) DO UPDATE SET
      plan = 'paid', access_until = excluded.access_until, source = excluded.source,
      stripe_customer_id = COALESCE(excluded.stripe_customer_id, entitlements.stripe_customer_id),
      stripe_checkout_session = COALESCE(excluded.stripe_checkout_session, entitlements.stripe_checkout_session),
      granted_at = datetime('now'), updated_at = datetime('now')
  `).run(userId, accessUntil, opts.source, opts.stripeCustomerId ?? null, opts.checkoutSession ?? null);
}

export function stripeCustomerFor(userId: number): string | null {
  const row = getDb().prepare('SELECT stripe_customer_id FROM entitlements WHERE user_id = ?').get(userId) as
    | Pick<EntitlementRow, 'stripe_customer_id'>
    | undefined;
  return row?.stripe_customer_id ?? null;
}
