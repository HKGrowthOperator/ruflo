'use client';

/**
 * Prüfungsmodus (§20): Timer, Aufgabenübersicht, Markieren, Autosave,
 * keine Hilfen, keine Sofortbewertung, Abgabe am Ende.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TaskCard, type AnswerPayloadDto, type PublicQuestionDto } from '@/components/TaskCard';

interface SimState {
  simId: number;
  kind: string;
  submitted: boolean;
  timeLimitS: number;
  remainingS: number;
  items: {
    position: number;
    flagged: boolean;
    answered: boolean;
    answer: AnswerPayloadDto | null;
    question: PublicQuestionDto | null;
  }[];
}

export default function SimulationRunnerPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [sim, setSim] = useState<SimState | null>(null);
  const [pos, setPos] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const draftRef = useRef<Map<string, AnswerPayloadDto>>(new Map());
  const flagsRef = useRef<Map<string, boolean>>(new Map());

  useEffect(() => {
    fetch(`/api/simulation/${params.id}`)
      .then((res) => res.json() as Promise<SimState>)
      .then((s) => {
        if (s.submitted) {
          router.replace(`/simulation/${params.id}/auswertung`);
          return;
        }
        setSim(s);
        setRemaining(s.remainingS);
        for (const it of s.items) {
          if (it.answer && it.question) draftRef.current.set(it.question.id, it.answer);
          if (it.question) flagsRef.current.set(it.question.id, it.flagged);
        }
      });
  }, [params.id, router]);

  const submitAll = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    await fetch(`/api/simulation/${params.id}/submit`, { method: 'POST' });
    router.push(`/simulation/${params.id}/auswertung`);
  }, [params.id, router, submitting]);

  // Countdown; bei 0 automatische Abgabe
  useEffect(() => {
    if (!sim) return;
    const t = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(t);
          void submitAll();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [sim, submitAll]);

  const save = useCallback(
    (questionId: string, answer: AnswerPayloadDto) => {
      draftRef.current.set(questionId, answer);
      void fetch(`/api/simulation/${params.id}/answer`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ questionId, answer, flagged: flagsRef.current.get(questionId) ?? false }),
      });
    },
    [params.id],
  );

  if (!sim) return <p className="text-sm text-ink-500">Simulation wird geladen…</p>;

  const item = sim.items[pos];
  if (!item?.question) return <p className="text-sm text-red-700">Aufgabe fehlt.</p>;
  const q = item.question;

  const mm = Math.floor(remaining / 60);
  const ss = String(remaining % 60).padStart(2, '0');
  const answeredCount = sim.items.filter((it) => it.question && draftRef.current.has(it.question.id)).length;

  return (
    <div className="space-y-4">
      <div className="card flex items-center justify-between py-3">
        <span className={`text-lg font-bold tabular-nums ${remaining < 300 ? 'text-red-600' : ''}`}>
          {mm}:{ss}
        </span>
        <span className="text-sm text-ink-600">{answeredCount} / {sim.items.length} beantwortet</span>
        <button className="btn-primary" onClick={submitAll} disabled={submitting}>
          {submitting ? 'Wird bewertet…' : 'Abgeben'}
        </button>
      </div>

      {/* Aufgabenübersicht */}
      <div className="flex flex-wrap gap-1.5">
        {sim.items.map((it, i) => {
          const qid = it.question?.id;
          const answered = qid ? draftRef.current.has(qid) : false;
          const flagged = qid ? flagsRef.current.get(qid) : false;
          return (
            <button
              key={i}
              onClick={() => setPos(i)}
              className={`h-9 w-9 rounded-lg border text-sm font-semibold ${
                i === pos
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : flagged
                    ? 'border-amber-400 bg-amber-50 text-amber-800'
                    : answered
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                      : 'border-ink-200 bg-white text-ink-600'
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <TaskCard
        key={q.id}
        question={q}
        allowHelp={false}
        askConfidence={false}
        initialAnswer={draftRef.current.get(q.id) ?? null}
        onDraftChange={(a) => save(q.id, a)}
        onSubmit={async () => {
          // Prüfungsmodus: keine Sofortbewertung — "Abgeben" heißt hier "nächste Aufgabe"
          return null;
        }}
        onNext={() => setPos((p) => Math.min(sim.items.length - 1, p + 1))}
      />

      <div className="flex justify-between">
        <button className="btn-secondary" onClick={() => setPos((p) => Math.max(0, p - 1))} disabled={pos === 0}>
          ← Zurück
        </button>
        <button
          className="btn-secondary"
          onClick={() => {
            flagsRef.current.set(q.id, !(flagsRef.current.get(q.id) ?? false));
            const a = draftRef.current.get(q.id);
            if (a) save(q.id, a);
            setSim({ ...sim });
          }}
        >
          {flagsRef.current.get(q.id) ? 'Markierung entfernen' : 'Markieren'}
        </button>
        <button
          className="btn-secondary"
          onClick={() => setPos((p) => Math.min(sim.items.length - 1, p + 1))}
          disabled={pos === sim.items.length - 1}
        >
          Weiter →
        </button>
      </div>
    </div>
  );
}
