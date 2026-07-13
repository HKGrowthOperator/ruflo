'use client';

/** Onboarding (§16): Pflichtangaben + optionale Lernbesonderheiten. */
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [examDate, setExamDate] = useState('');
  const [goal, setGoal] = useState('bestehen');
  const [minutesWeekday, setMinutesWeekday] = useState(60);
  const [minutesWeekend, setMinutesWeekend] = useState(90);
  const [learnTime, setLearnTime] = useState('abends');
  const [focusBlock, setFocusBlock] = useState(25);
  const [selfAssessment, setSelfAssessment] = useState(2);
  const [flags, setFlags] = useState({ adhs: false, konzentration: false, pruefungsangst: false, rechenprobleme: false, sprache: false });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        examDate,
        goal,
        minutesWeekday,
        minutesWeekend,
        learnTime,
        focusBlockMinutes: focusBlock,
        selfAssessment,
        ...flags,
      }),
    });
    setBusy(false);
    if (res.ok) {
      router.push('/diagnose');
      router.refresh();
    } else {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? 'Fehler beim Speichern');
    }
  }

  const flagLabels: Record<keyof typeof flags, string> = {
    adhs: 'ADHS / schnelle Ablenkung',
    konzentration: 'Konzentration fällt mir schwer',
    pruefungsangst: 'Prüfungsangst',
    rechenprobleme: 'Rechnen fällt mir schwer',
    sprache: 'Lange Texte / Fachsprache fallen mir schwer',
  };

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-1 text-2xl font-bold">Dein Lernprofil</h1>
      <p className="mb-6 text-sm text-ink-600">
        Daraus berechnet der Coach deinen Modus, deinen Tagesplan und deine Wiederholungen.
      </p>
      <form onSubmit={submit} className="card space-y-5">
        <div>
          <label className="label" htmlFor="examDate">Prüfungstermin (schriftlich) *</label>
          <input id="examDate" type="date" className="input" value={examDate} onChange={(e) => setExamDate(e.target.value)} required />
        </div>
        <div>
          <label className="label" htmlFor="goal">Ziel</label>
          <select id="goal" className="input" value={goal} onChange={(e) => setGoal(e.target.value)}>
            <option value="bestehen">Sicher bestehen</option>
            <option value="gut_bestehen">Gut bestehen</option>
            <option value="sehr_gut">Sehr gutes Ergebnis</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="mwd">Minuten werktags</label>
            <input id="mwd" type="number" min={10} max={600} className="input" value={minutesWeekday} onChange={(e) => setMinutesWeekday(Number(e.target.value))} />
          </div>
          <div>
            <label className="label" htmlFor="mwe">Minuten am Wochenende</label>
            <input id="mwe" type="number" min={0} max={600} className="input" value={minutesWeekend} onChange={(e) => setMinutesWeekend(Number(e.target.value))} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="lt">Beste Lernzeit</label>
            <select id="lt" className="input" value={learnTime} onChange={(e) => setLearnTime(e.target.value)}>
              <option value="morgens">Morgens</option>
              <option value="mittags">Mittags</option>
              <option value="abends">Abends</option>
              <option value="wechselnd">Wechselnd</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="fb">Konzentrationsblock (min)</label>
            <input id="fb" type="number" min={10} max={90} className="input" value={focusBlock} onChange={(e) => setFocusBlock(Number(e.target.value))} />
          </div>
        </div>
        <div>
          <label className="label">Selbsteinschätzung: Wie fit fühlst du dich? *</label>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                type="button"
                key={n}
                onClick={() => setSelfAssessment(n)}
                className={`flex-1 rounded-xl border py-2 text-sm font-semibold ${
                  selfAssessment === n ? 'border-brand-500 bg-brand-50 text-brand-800' : 'border-ink-200 bg-white text-ink-500'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-ink-500">1 = kaum Vorwissen · 5 = sehr fit</p>
        </div>
        <div>
          <label className="label">Optional: Was trifft auf dich zu?</label>
          <div className="space-y-1.5">
            {(Object.keys(flags) as (keyof typeof flags)[]).map((k) => (
              <label key={k} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={flags[k]}
                  onChange={(e) => setFlags((f) => ({ ...f, [k]: e.target.checked }))}
                  className="h-4 w-4 rounded border-ink-300"
                />
                {flagLabels[k]}
              </label>
            ))}
          </div>
        </div>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? 'Wird gespeichert…' : 'Weiter zur Eingangsdiagnose'}
        </button>
      </form>
    </div>
  );
}
