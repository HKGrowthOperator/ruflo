/** Auswertung (§21): Punkte, Bereiche, Aufgabentypen, verlorene Punkte nach Ursache, Reparaturplan. */
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { ERROR_CODE_LABELS, MAIN_AREA_LABELS, type ErrorCode, type MainArea } from '@/lib/domain/types';
import type { SimEvaluation } from '@/lib/services/simulations';

export const dynamic = 'force-dynamic';

const CATEGORY_LABELS: Record<string, string> = {
  gebunden: 'Gebundene Aufgaben (MC/Zuordnung)',
  kurzantwort: 'Freie Antworten',
  plan: 'Plan-/Bildaufgaben',
  rechnen: 'Rechnen',
  systemauswahl: 'Systemauswahl',
  projekt: 'Projekt/Ablauf',
};

export default async function AuswertungPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await currentUser();
  if (!user) redirect('/login');
  const db = getDb();
  const sim = db.prepare('SELECT * FROM simulations WHERE id = ? AND user_id = ?').get(Number(id), user.id) as
    | { id: number; kind: string; submitted_at: string | null; score_json: string | null }
    | undefined;
  if (!sim) notFound();
  if (!sim.submitted_at || !sim.score_json) redirect(`/simulation/${id}`);

  const ev = JSON.parse(sim.score_json) as SimEvaluation;
  const percentColor = ev.percent >= 60 ? 'text-emerald-600' : ev.percent >= 45 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="space-y-5">
      <section className="card text-center">
        <p className="text-sm text-ink-500">Ergebnis</p>
        <p className={`text-5xl font-bold ${percentColor}`}>{ev.percent} %</p>
        <p className="mt-1 text-sm text-ink-600">
          {ev.totalPoints} von {ev.maxPoints} Punkten · {Math.round(ev.timeUsedS / 60)} min gebraucht
        </p>
        <p className="mt-2 text-sm font-medium">
          {ev.percent >= 60
            ? 'Damit wärst du im bestandenen Bereich. Jetzt stabilisieren.'
            : ev.percent >= 45
              ? 'Knapp unter der Schwelle — der Reparaturplan zeigt die schnellsten Punkte.'
              : 'Noch deutlicher Rückstand — konzentriere dich auf die Reparaturthemen unten.'}
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 text-sm font-semibold text-ink-700">Nach Fachbereich</h2>
          <ul className="space-y-1.5 text-sm">
            {ev.byArea.map((a) => (
              <li key={a.area} className="flex justify-between">
                <span>{MAIN_AREA_LABELS[a.area as MainArea] ?? a.area}</span>
                <span className="font-semibold">{a.points}/{a.max} P.</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h2 className="mb-3 text-sm font-semibold text-ink-700">Nach Aufgabentyp</h2>
          <ul className="space-y-1.5 text-sm">
            {ev.byCategory.map((c) => (
              <li key={c.category} className="flex justify-between">
                <span>{CATEGORY_LABELS[c.category] ?? c.category}</span>
                <span className="font-semibold">{c.points}/{c.max} P.</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {ev.byErrorCode.length > 0 && (
        <section className="card">
          <h2 className="mb-3 text-sm font-semibold text-ink-700">Verlorene Punkte nach Ursache</h2>
          <ul className="space-y-1.5 text-sm">
            {ev.byErrorCode.slice(0, 6).map((e) => (
              <li key={e.code} className="flex justify-between">
                <span>{ERROR_CODE_LABELS[e.code as ErrorCode] ?? e.code}</span>
                <span className="font-semibold text-red-600">−{e.lostPoints} P.</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {ev.repairPlan.length > 0 && (
        <section className="card">
          <h2 className="mb-1 text-sm font-semibold text-ink-700">Reparaturplan — hier liegen deine Punkte</h2>
          <p className="mb-3 text-xs text-ink-500">
            Diese Kompetenzen sind bereits in deinen nächsten Tagesplan eingeflossen.
          </p>
          <ol className="list-decimal space-y-1 pl-5 text-sm">
            {ev.repairPlan.map((r) => (
              <li key={r.competencyId}>
                {r.title} <span className="text-ink-500">({r.lostPoints} P. liegen gelassen)</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="flex gap-2">
        <Link href="/session" className="btn-primary flex-1 justify-center">Reparatur jetzt lernen</Link>
        <Link href="/dashboard" className="btn-secondary flex-1 justify-center">Zum Lernstand</Link>
      </div>
    </div>
  );
}
