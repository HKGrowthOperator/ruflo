/** Simulationsübersicht: Start neuer Simulationen + bisherige Ergebnisse. */
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { StartSimButton } from '@/components/StartSimButton';

export const dynamic = 'force-dynamic';

const KINDS = [
  { kind: 'mini', title: 'Mini-Simulation', desc: '8 Aufgaben · 25 min · schneller Check' },
  { kind: 'teil', title: 'Teilprüfung', desc: '16 Aufgaben · 55 min · halbe Prüfungslänge' },
  { kind: 'voll', title: 'Vollsimulation', desc: '28 Aufgaben · 110 min · realistische Belastung' },
] as const;

export default async function SimulationListPage() {
  const user = await currentUser();
  if (!user) redirect('/login');
  const db = getDb();
  const sims = db
    .prepare(
      `SELECT id, kind, started_at, submitted_at, score_json FROM simulations
       WHERE user_id = ? ORDER BY started_at DESC LIMIT 10`,
    )
    .all(user.id) as { id: number; kind: string; started_at: string; submitted_at: string | null; score_json: string | null }[];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Prüfungssimulation</h1>
        <p className="text-sm text-ink-600">
          Timer läuft, keine Hilfen, keine Sofortbewertung — Abgabe am Ende (wie in der echten Prüfung).
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {KINDS.map((k) => (
          <div key={k.kind} className="card flex flex-col justify-between gap-3">
            <div>
              <h2 className="font-semibold">{k.title}</h2>
              <p className="text-xs text-ink-500">{k.desc}</p>
            </div>
            <StartSimButton kind={k.kind} />
          </div>
        ))}
      </div>
      {sims.length > 0 && (
        <section className="card">
          <h2 className="mb-3 text-sm font-semibold text-ink-700">Bisherige Simulationen</h2>
          <ul className="divide-y divide-ink-100 text-sm">
            {sims.map((s) => {
              const score = s.score_json ? (JSON.parse(s.score_json) as { percent: number }) : null;
              return (
                <li key={s.id} className="flex items-center justify-between py-2">
                  <span>
                    {s.kind === 'mini' ? 'Mini' : s.kind === 'teil' ? 'Teilprüfung' : 'Vollsimulation'} ·{' '}
                    {s.started_at.slice(0, 10)}
                  </span>
                  {s.submitted_at ? (
                    <Link href={`/simulation/${s.id}/auswertung`} className="font-semibold text-brand-700 hover:underline">
                      {score?.percent ?? '–'} % → Auswertung
                    </Link>
                  ) : (
                    <Link href={`/simulation/${s.id}`} className="font-semibold text-amber-700 hover:underline">
                      fortsetzen
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
