/** Konto: Zugangsstatus, Passwort ändern, Abmelden. */
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import { accessFor, getEntitlement } from '@/lib/services/entitlements';
import { paymentsEnabled } from '@/lib/config';
import { ChangePasswordForm } from '@/components/ChangePasswordForm';

export const dynamic = 'force-dynamic';

export default async function KontoPage() {
  const user = await currentUser();
  if (!user) redirect('/login');
  const access = accessFor(user.id);
  const ent = getEntitlement(user.id);
  const payments = paymentsEnabled();

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <h1 className="text-2xl font-bold">Konto</h1>

      <section className="card space-y-1">
        <p className="text-sm text-ink-500">Angemeldet als</p>
        <p className="font-semibold">{user.displayName}</p>
        <p className="text-sm text-ink-600">{user.email}</p>
      </section>

      <section className="card space-y-2">
        <p className="text-sm font-semibold text-ink-700">Zugang</p>
        {!payments ? (
          <p className="text-sm text-emerald-700">Vollzugang (kostenlose Testphase — alle Funktionen frei).</p>
        ) : access.hasFullAccess ? (
          <p className="text-sm text-emerald-700">
            Vollzugang aktiv
            {ent?.accessUntil ? ` – gültig bis ${ent.accessUntil.slice(0, 10)}` : ''}.
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-ink-600">
              Kostenloser Probierzugang (Diagnose &amp; Risikoprofil). Lerneinheiten und Simulationen sind
              noch nicht freigeschaltet.
            </p>
            <Link href="/preise" className="btn-primary inline-flex">Vollzugang freischalten</Link>
          </div>
        )}
      </section>

      <section className="card">
        <p className="mb-3 text-sm font-semibold text-ink-700">Passwort ändern</p>
        <ChangePasswordForm />
      </section>
    </div>
  );
}
