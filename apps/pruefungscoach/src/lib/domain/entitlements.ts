/**
 * Zugangslogik (kommerziell) — deterministisch und rein testbar.
 *
 * Grundprinzip:
 * - Sind KEINE Zahlungen konfiguriert (kein Stripe-Key), läuft die App im
 *   "Free-Live"-Modus: alle Funktionen sind frei. So kann man sie sofort für
 *   echte Testnutzer online stellen, bevor Bezahlung eingerichtet ist.
 * - Sind Zahlungen aktiv, entscheidet die Berechtigung (entitlement), welche
 *   Funktionen frei sind. Kostenlos bleibt immer: Registrierung, Onboarding,
 *   Eingangsdiagnose und das Ergebnis-/Risikoprofil (der "Probierteil").
 *   Kostenpflichtig sind die adaptiven Lernsessions und Prüfungssimulationen.
 */

export type Plan = 'free' | 'paid';

/** Funktionen, die eine Bezahlung erfordern, sobald Zahlungen aktiv sind. */
export const PAID_FEATURES = ['session', 'simulation'] as const;
export type PaidFeature = (typeof PAID_FEATURES)[number];

export interface Entitlement {
  plan: Plan;
  accessUntil: string | null; // ISO
}

export interface AccessInput {
  /** true, sobald Stripe konfiguriert ist */
  paymentsEnabled: boolean;
  entitlement: Entitlement | null;
  now: Date;
}

export interface AccessResult {
  /** darf der Nutzer die bezahlpflichtigen Funktionen nutzen? */
  hasFullAccess: boolean;
  /** Grund für die UI/Debug */
  reason: 'free_live' | 'paid_active' | 'paid_expired' | 'no_entitlement' | 'free_plan';
}

/** Ist der bezahlte Zugang (noch) gültig? */
export function isPaidActive(entitlement: Entitlement | null, now: Date): boolean {
  if (!entitlement || entitlement.plan !== 'paid') return false;
  if (!entitlement.accessUntil) return true; // unbegrenzt
  return new Date(entitlement.accessUntil).getTime() >= now.getTime();
}

export function resolveAccess(input: AccessInput): AccessResult {
  if (!input.paymentsEnabled) return { hasFullAccess: true, reason: 'free_live' };
  if (!input.entitlement) return { hasFullAccess: false, reason: 'no_entitlement' };
  if (input.entitlement.plan !== 'paid') return { hasFullAccess: false, reason: 'free_plan' };
  if (isPaidActive(input.entitlement, input.now)) return { hasFullAccess: true, reason: 'paid_active' };
  return { hasFullAccess: false, reason: 'paid_expired' };
}

/**
 * Zugangsdauer nach Kauf. Modell "Einmalkauf bis zur Prüfung":
 * Zugang bis Prüfungstermin + Puffer; falls kein Termin bekannt, 1 Jahr.
 */
export function purchaseAccessUntil(examDate: string | null, now: Date, bufferDays = 14): string {
  if (examDate) {
    const exam = new Date(`${examDate.slice(0, 10)}T23:59:59`);
    exam.setDate(exam.getDate() + bufferDays);
    // mindestens 30 Tage Zugang, auch wenn die Prüfung schon sehr nah/vorbei ist
    const min = new Date(now.getTime() + 30 * 86_400_000);
    return (exam.getTime() > min.getTime() ? exam : min).toISOString();
  }
  return new Date(now.getTime() + 365 * 86_400_000).toISOString();
}
