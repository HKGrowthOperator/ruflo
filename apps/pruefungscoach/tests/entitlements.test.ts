import { describe, expect, it } from 'vitest';
import { isPaidActive, purchaseAccessUntil, resolveAccess } from '@/lib/domain/entitlements';

const now = new Date('2026-07-14T10:00:00Z');

describe('resolveAccess', () => {
  it('Free-Live: ohne aktive Zahlungen ist alles frei', () => {
    expect(resolveAccess({ paymentsEnabled: false, entitlement: null, now }).hasFullAccess).toBe(true);
    expect(resolveAccess({ paymentsEnabled: false, entitlement: { plan: 'free', accessUntil: null }, now }).reason).toBe('free_live');
  });

  it('mit Zahlungen: ohne Berechtigung kein Vollzugang', () => {
    const r = resolveAccess({ paymentsEnabled: true, entitlement: null, now });
    expect(r.hasFullAccess).toBe(false);
    expect(r.reason).toBe('no_entitlement');
  });

  it('mit Zahlungen: free-Plan hat keinen Vollzugang', () => {
    const r = resolveAccess({ paymentsEnabled: true, entitlement: { plan: 'free', accessUntil: null }, now });
    expect(r.hasFullAccess).toBe(false);
    expect(r.reason).toBe('free_plan');
  });

  it('mit Zahlungen: bezahlter, gültiger Zugang', () => {
    const r = resolveAccess({ paymentsEnabled: true, entitlement: { plan: 'paid', accessUntil: '2026-08-01T00:00:00Z' }, now });
    expect(r.hasFullAccess).toBe(true);
    expect(r.reason).toBe('paid_active');
  });

  it('mit Zahlungen: abgelaufener Zugang', () => {
    const r = resolveAccess({ paymentsEnabled: true, entitlement: { plan: 'paid', accessUntil: '2026-07-01T00:00:00Z' }, now });
    expect(r.hasFullAccess).toBe(false);
    expect(r.reason).toBe('paid_expired');
  });

  it('unbegrenzter bezahlter Zugang (access_until null)', () => {
    expect(isPaidActive({ plan: 'paid', accessUntil: null }, now)).toBe(true);
  });
});

describe('purchaseAccessUntil', () => {
  it('Zugang bis Prüfung + Puffer', () => {
    const until = purchaseAccessUntil('2026-09-01', now, 14);
    expect(until.slice(0, 10)).toBe('2026-09-15');
  });

  it('mindestens 30 Tage, auch wenn Prüfung sehr nah', () => {
    const until = purchaseAccessUntil('2026-07-15', now, 14);
    expect(new Date(until).getTime()).toBeGreaterThanOrEqual(now.getTime() + 29 * 86_400_000);
  });

  it('ohne Termin: ein Jahr', () => {
    const until = purchaseAccessUntil(null, now);
    expect(new Date(until).getFullYear()).toBe(2027);
  });
});
