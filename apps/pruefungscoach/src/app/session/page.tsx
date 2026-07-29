'use client';

/** Adaptive Lernsession (§18): nächste Aufgabe vom Server, Hilfen erlaubt. */
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { TaskCard, type AnswerPayloadDto, type FeedbackDto, type PublicQuestionDto } from '@/components/TaskCard';

interface NextItem {
  done: boolean;
  planItemId?: number;
  kind?: string;
  competencyTitle?: string;
  progress: { done: number; total: number };
  question?: PublicQuestionDto;
}

const KIND_LABELS: Record<string, string> = {
  review: 'Wiederholung',
  deficit: 'Hauptdefizit',
  foundation: 'Grundlagen',
  transfer: 'Transfer',
  secure: 'Sichere Punkte',
};

export default function SessionPage() {
  const [item, setItem] = useState<NextItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadNext = useCallback(() => {
    setItem(null);
    fetch('/api/session/next')
      .then(async (res) => {
        if (res.status === 402) throw new Error('ZUGANG');
        if (!res.ok) throw new Error((await res.json() as { error?: string }).error ?? 'Fehler');
        return res.json() as Promise<NextItem>;
      })
      .then(setItem)
      .catch((e: Error) => setError(e.message));
  }, []);

  useEffect(loadNext, [loadNext]);

  if (error === 'ZUGANG') {
    return (
      <div className="card space-y-3 text-center">
        <h1 className="text-xl font-bold">Vollzugang erforderlich</h1>
        <p className="text-sm text-ink-600">
          Die täglichen Lerneinheiten gehören zum Vollzugang. Schalte ihn frei und lerne bis zu deiner Prüfung.
        </p>
        <Link className="btn-primary inline-flex" href="/preise">Vollzugang freischalten</Link>
      </div>
    );
  }
  if (error) {
    return (
      <div className="card space-y-2 text-sm">
        <p className="text-red-700">{error}</p>
        {error.includes('Onboarding') && (
          <Link className="btn-primary inline-flex" href="/onboarding">Onboarding starten</Link>
        )}
      </div>
    );
  }
  if (!item) return <p className="text-sm text-ink-500">Nächste Aufgabe wird gewählt…</p>;

  if (item.done || !item.question) {
    return (
      <div className="card space-y-3 text-center">
        <h1 className="text-xl font-bold">Tagesziel erreicht</h1>
        <p className="text-sm text-ink-600">
          {item.progress.done} Aufgaben bearbeitet. Morgen stehen deine Wiederholungen bereit.
        </p>
        <div className="flex justify-center gap-2">
          <Link href="/dashboard" className="btn-secondary">Zum Lernstand</Link>
          <Link href="/simulation" className="btn-primary">Mini-Simulation starten</Link>
        </div>
      </div>
    );
  }

  async function submit(answer: AnswerPayloadDto, meta: { helpLevel: number; confidence: string | null; timeTakenSeconds: number }): Promise<FeedbackDto | null> {
    const res = await fetch('/api/attempt', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        questionId: item!.question!.id,
        context: item!.kind === 'review' ? 'review' : 'session',
        answer,
        helpLevel: meta.helpLevel,
        confidence: meta.confidence,
        timeTakenSeconds: meta.timeTakenSeconds,
        planItemId: item!.planItemId,
      }),
    });
    if (!res.ok) return null;
    return res.json() as Promise<FeedbackDto>;
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-1 flex items-center justify-between text-sm text-ink-600">
          <span>
            <span className="badge mr-2 bg-brand-100 text-brand-800">{KIND_LABELS[item.kind ?? ''] ?? item.kind}</span>
            <span className="font-medium">{item.competencyTitle}</span>
          </span>
          <span>{item.progress.done + 1} / {item.progress.total}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-ink-200">
          <div className="h-full bg-brand-500 transition-all" style={{ width: `${(item.progress.done / Math.max(1, item.progress.total)) * 100}%` }} />
        </div>
      </div>
      <TaskCard
        question={item.question}
        allowHelp
        askConfidence
        onSubmit={submit}
        onNext={loadNext}
      />
    </div>
  );
}
