/**
 * Öffentliche Landingpage (Verkaufsseite). Erklärt das Produkt, zeigt den
 * Ablauf und den Preis, führt zur Registrierung. Für angemeldete Nutzer
 * Weiterleitung ins Dashboard.
 */
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import { displayPriceEuro, paymentsEnabled } from '@/lib/config';

export const dynamic = 'force-dynamic';

const STEPS = [
  { t: 'Diagnose', d: 'Ein kurzer Eingangstest zeigt in 20–30 Minuten, wo du wirklich stehst — über alle Prüfungsbereiche.' },
  { t: 'Tagesplan', d: 'Der Coach berechnet aus Prüfungsrelevanz, deinen Lücken und der Restzeit, was du heute lernst.' },
  { t: 'Aktiv üben', d: 'Eine Aufgabe nach der anderen — mit gestufter Hilfe, Musterlösung und Feedback nach Fehlerursache.' },
  { t: 'Wiederholen', d: 'Was sitzt, kommt seltener; was wackelt, öfter — automatisch terminiert bis zur Prüfung.' },
  { t: 'Simulieren', d: 'Realistische Prüfungssimulation mit Timer, danach Punkte- und Fehlerauswertung mit Reparaturplan.' },
];

const FEATURES = [
  ['Aus echten Altprüfungen', 'Die Aufgaben und Gewichtungen basieren auf echten IHK-Prüfungen — nicht auf Bauchgefühl.'],
  ['Kein Chatbot', 'Ein geführter Lernkreislauf statt offenem Chatfenster. Du musst nicht selbst entscheiden, was dran ist.'],
  ['Fehler werden verstanden', 'Der Coach merkt sich Fehlerursachen — verwechselte Begriffe, übersehene Anforderungen, Rechenmethodik.'],
  ['Ehrliche Prognose', 'Du siehst jederzeit deinen erwartbaren Punktebereich und dein größtes Risiko — ohne Schönfärberei.'],
];

export default async function LandingPage() {
  const user = await currentUser();
  if (user) redirect('/dashboard');
  const showPrice = paymentsEnabled();

  return (
    <div className="space-y-12 py-4">
      {/* Hero */}
      <section className="space-y-5 text-center">
        <span className="badge bg-brand-100 text-brand-800">IHK-Abschlussprüfung · Trockenbaumonteur</span>
        <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          Dein digitaler Prüfungscoach —<br className="hidden sm:block" /> abgestimmt auf die echte Prüfung.
        </h1>
        <p className="mx-auto max-w-xl text-base text-ink-600">
          Kein Auswendiglernen ins Blaue. Der Coach diagnostiziert deinen Stand, priorisiert nach echter
          Prüfungsrelevanz und bringt dich mit adaptiven Aufgaben gezielt über die Bestehensgrenze — auch wenn
          du spät dran bist.
        </p>
        <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
          <Link href="/login" className="btn-primary px-6 py-3 text-base">Kostenlos starten</Link>
          <Link href="/preise" className="btn-secondary px-6 py-3 text-base">Preise ansehen</Link>
        </div>
        <p className="text-xs text-ink-500">Diagnose &amp; Risikoprofil kostenlos — ohne Risiko ausprobieren.</p>
      </section>

      {/* So funktioniert's */}
      <section>
        <h2 className="mb-5 text-center text-xl font-bold">So funktioniert der Coach</h2>
        <div className="grid gap-3 sm:grid-cols-5">
          {STEPS.map((s, i) => (
            <div key={s.t} className="card">
              <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                {i + 1}
              </div>
              <p className="font-semibold">{s.t}</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-600">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Warum */}
      <section className="grid gap-3 sm:grid-cols-2">
        {FEATURES.map(([t, d]) => (
          <div key={t} className="card">
            <p className="font-semibold">{t}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-600">{d}</p>
          </div>
        ))}
      </section>

      {/* Preis-Teaser */}
      <section className="card mx-auto max-w-md text-center">
        <h2 className="text-xl font-bold">Vollzugang bis zu deiner Prüfung</h2>
        {showPrice ? (
          <p className="mt-2 text-4xl font-bold">
            {displayPriceEuro()} €<span className="text-base font-normal text-ink-500"> einmalig</span>
          </p>
        ) : (
          <p className="mt-2 text-lg font-semibold text-emerald-700">Zurzeit kostenlos in der Testphase</p>
        )}
        <ul className="mx-auto mt-4 max-w-xs space-y-1.5 text-left text-sm text-ink-700">
          <li>✓ Adaptive Tagespläne bis zum Prüfungstag</li>
          <li>✓ Unbegrenzte Lernsessions &amp; Wiederholungen</li>
          <li>✓ Prüfungssimulationen mit Auswertung</li>
          <li>✓ Aufgaben aus echten Altprüfungen</li>
        </ul>
        <Link href="/login" className="btn-primary mt-5 w-full">Jetzt starten</Link>
      </section>
    </div>
  );
}
