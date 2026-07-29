/** Landeseite nach erfolgreicher Stripe-Zahlung. Freischaltung erfolgt per Webhook. */
import Link from 'next/link';

export const metadata = { title: 'Kauf erfolgreich' };

export default function KaufErfolgPage() {
  return (
    <div className="mx-auto mt-10 max-w-md text-center">
      <div className="card space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl">✓</div>
        <h1 className="text-xl font-bold">Zahlung erhalten – danke!</h1>
        <p className="text-sm text-ink-600">
          Dein Vollzugang wird jetzt freigeschaltet. Das kann einen kurzen Moment dauern. Öffne dein Dashboard
          und leg los — falls die Lerneinheiten noch gesperrt sind, lade die Seite in ein paar Sekunden neu.
        </p>
        <Link href="/dashboard" className="btn-primary">Zum Dashboard</Link>
      </div>
    </div>
  );
}
