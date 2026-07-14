/** Preis-/Kaufseite. Verhalten je nach Anmeldung und Bezahlstatus. */
import Link from 'next/link';
import { currentUser } from '@/lib/auth';
import { accessFor } from '@/lib/services/entitlements';
import { displayPriceEuro, paymentsEnabled } from '@/lib/config';
import { CheckoutButton } from '@/components/CheckoutButton';

export const dynamic = 'force-dynamic';

const INCLUDED = [
  'Adaptive Tagespläne bis zum Prüfungstag',
  'Unbegrenzte Lernsessions mit gestufter Hilfe',
  'Intelligente Wiederholungen (Spaced Repetition)',
  'Prüfungssimulationen mit Timer & Auswertung',
  'Aufgaben aus echten IHK-Altprüfungen',
  'Ehrliche Punkte- und Risikoprognose',
];

export default async function PreisePage() {
  const user = await currentUser();
  const payments = paymentsEnabled();
  const access = user ? accessFor(user.id) : null;
  const alreadyPaid = access?.hasFullAccess && payments;

  return (
    <div className="mx-auto max-w-md space-y-5">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Vollzugang</h1>
        <p className="mt-1 text-sm text-ink-600">
          Alles, was du zum gezielten Bestehen brauchst — in einem Zugang bis zu deiner Prüfung.
        </p>
      </div>

      <section className="card text-center">
        {payments ? (
          <p className="text-4xl font-bold">
            {displayPriceEuro()} €<span className="text-base font-normal text-ink-500"> einmalig</span>
          </p>
        ) : (
          <p className="text-xl font-semibold text-emerald-700">Zurzeit kostenlos (Testphase)</p>
        )}
        <ul className="mx-auto mt-4 space-y-1.5 text-left text-sm text-ink-700">
          {INCLUDED.map((f) => (
            <li key={f}>✓ {f}</li>
          ))}
        </ul>

        <div className="mt-5">
          {!user ? (
            <Link href="/login" className="btn-primary w-full">Kostenlos starten</Link>
          ) : alreadyPaid ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-emerald-700">Dein Vollzugang ist aktiv.</p>
              <Link href="/dashboard" className="btn-secondary w-full">Zum Dashboard</Link>
            </div>
          ) : payments ? (
            <CheckoutButton label={`Für ${displayPriceEuro()} € freischalten`} />
          ) : (
            <Link href="/dashboard" className="btn-primary w-full">Jetzt kostenlos loslegen</Link>
          )}
        </div>
        <p className="mt-3 text-xs text-ink-500">
          Zahlung sicher über Stripe. Keine automatische Verlängerung — Einmalkauf.
        </p>
      </section>

      <p className="text-center text-xs text-ink-500">
        Mit dem Kauf akzeptierst du die <Link href="/agb" className="underline">AGB</Link> und die{' '}
        <Link href="/datenschutz" className="underline">Datenschutzerklärung</Link>.
      </p>
    </div>
  );
}
