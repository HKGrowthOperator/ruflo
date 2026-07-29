/**
 * Lern-Dashboard (§18/§22): Countdown, Hauptaktion, Punktebereich, Risiko, Hebel,
 * fällige Wiederholungen, Bereichs-Lernstand — ruhig und fokussiert.
 */
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { daysUntil, PLAN_MODE_LABELS } from '@/lib/domain/modes';
import { READINESS_LABELS } from '@/lib/domain/readiness';
import { ERROR_CODE_LABELS, MAIN_AREA_LABELS, type ErrorCode, type MainArea, type PlanMode } from '@/lib/domain/types';
import { areaStats, errorProfile, readinessFor, riskAndLever } from '@/lib/services/stats';
import { getOrCreateTodayPlan } from '@/lib/services/plan';
import { accessFor } from '@/lib/services/entitlements';
import { displayPriceEuro } from '@/lib/config';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect('/login');

  const db = getDb();
  const profile = db.prepare('SELECT * FROM learner_profiles WHERE user_id = ?').get(user.id) as
    | { exam_date: string; mode: PlanMode; onboarded_at: string | null; diagnosed_at: string | null }
    | undefined;
  if (!profile?.onboarded_at) redirect('/onboarding');
  if (!profile.diagnosed_at) redirect('/diagnose');

  const daysLeft = daysUntil(profile.exam_date);
  const readiness = readinessFor(user.id);
  const { biggestRisk, fastestLever, dueReviews, openCriticalErrors } = riskAndLever(user.id);
  const stats = areaStats(user.id);
  const errors = errorProfile(user.id).filter((e) => e.unresolved > 0).slice(0, 5);
  const plan = getOrCreateTodayPlan(user.id);
  const access = accessFor(user.id);
  const locked = !access.hasFullAccess;

  return (
    <div className="space-y-5">
      {/* Freischalt-Hinweis, wenn Zahlungen aktiv und noch nicht gekauft */}
      {locked && (
        <section className="card border-brand-200 bg-brand-50">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-brand-900">Vollzugang freischalten</p>
              <p className="text-sm text-brand-800">
                Deine Diagnose und dein Risikoprofil sind kostenlos. Für die täglichen Lerneinheiten und
                Prüfungssimulationen schalte den Vollzugang frei — Zugang bis zu deiner Prüfung.
              </p>
            </div>
            <Link href="/preise" className="btn-primary shrink-0">Ab {displayPriceEuro()} € freischalten</Link>
          </div>
        </section>
      )}

      {/* Kopf: Countdown + Hauptaktion */}
      <section className="card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-ink-500">Schriftliche Prüfung in</p>
          <p className="text-4xl font-bold tracking-tight">
            {daysLeft} {daysLeft === 1 ? 'Tag' : 'Tagen'}
          </p>
          <p className="mt-1 text-sm text-ink-600">
            Modus: <span className="font-semibold">{PLAN_MODE_LABELS[profile.mode]}</span>
            {plan && <> · heute {plan.minutesTarget} min · {plan.doneCount}/{plan.items.length} erledigt</>}
          </p>
        </div>
        <Link href={locked ? '/preise' : '/session'} className="btn-primary px-6 py-3 text-base">
          {locked ? 'Vollzugang freischalten' : 'Heutige Einheit starten'}
        </Link>
      </section>

      {/* Kacheln: Prognose, Risiko, Hebel */}
      <section className="grid gap-3 sm:grid-cols-3">
        <div className="card">
          <p className="text-sm text-ink-500">Punktebereich (Prognose)</p>
          <p className="text-2xl font-bold">
            {readiness.scoreRange[0]}–{readiness.scoreRange[1]} %
          </p>
          <p className="mt-1 text-xs text-ink-500">{READINESS_LABELS[readiness.status]}</p>
        </div>
        <div className="card">
          <p className="text-sm text-ink-500">Größtes Risiko</p>
          <p className="text-sm font-semibold leading-snug">{biggestRisk?.title ?? '—'}</p>
          <p className="mt-1 text-xs text-ink-500">
            {biggestRisk ? MAIN_AREA_LABELS[biggestRisk.area as MainArea] : ''}
            {openCriticalErrors > 0 && ` · ${openCriticalErrors} kritische Fehlkonzepte offen`}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-ink-500">Schnellster Hebel</p>
          <p className="text-sm font-semibold leading-snug">{fastestLever?.title ?? '—'}</p>
          <p className="mt-1 text-xs text-ink-500">
            {fastestLever ? MAIN_AREA_LABELS[fastestLever.area as MainArea] : ''}
            {dueReviews > 0 && ` · ${dueReviews} Wiederholungen fällig`}
          </p>
        </div>
      </section>

      {/* Bereichs-Lernstand */}
      <section className="card">
        <h2 className="mb-3 text-sm font-semibold text-ink-700">Lernstand nach Bereich</h2>
        <div className="space-y-2.5">
          {stats.map((s) => (
            <div key={s.area}>
              <div className="mb-0.5 flex justify-between text-xs text-ink-600">
                <span>{s.label}</span>
                <span>
                  {Math.round(s.avgMastery * 100)} % · {s.tested}/{s.total} getestet
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-ink-100">
                <div
                  className={`h-full rounded-full ${s.avgMastery >= 0.6 ? 'bg-emerald-500' : s.avgMastery >= 0.35 ? 'bg-amber-500' : 'bg-red-400'}`}
                  style={{ width: `${Math.max(2, Math.round(s.avgMastery * 100))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Fehlerprofil */}
      {errors.length > 0 && (
        <section className="card">
          <h2 className="mb-3 text-sm font-semibold text-ink-700">Offene Fehlerursachen</h2>
          <ul className="space-y-1.5 text-sm">
            {errors.map((e) => (
              <li key={e.code} className="flex justify-between">
                <span>{ERROR_CODE_LABELS[e.code as ErrorCode] ?? e.code}</span>
                <span className="font-semibold text-ink-500">{e.unresolved}×</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="flex gap-2">
        <Link href={locked ? '/preise' : '/simulation'} className="btn-secondary flex-1 justify-center">
          Prüfungssimulation
        </Link>
      </section>
    </div>
  );
}
