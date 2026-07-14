'use client';

/** Eingangsdiagnose (§17): Schnelltest ohne Hilfen, mit Confidence-Abfrage. */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TaskCard, type AnswerPayloadDto, type FeedbackDto, type PublicQuestionDto } from '@/components/TaskCard';

export default function DiagnosePage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<PublicQuestionDto[] | null>(null);
  const [index, setIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/diagnose')
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json() as { error?: string }).error ?? 'Fehler');
        return res.json() as Promise<{ questions: PublicQuestionDto[] }>;
      })
      .then((data) => setQuestions(data.questions))
      .catch((e: Error) => setError(e.message));
  }, []);

  if (error) return <p className="card text-sm text-red-700">{error}</p>;
  if (!questions) return <p className="text-sm text-ink-500">Diagnose wird zusammengestellt…</p>;
  if (questions.length === 0) {
    return (
      <div className="card text-sm">
        Noch keine freigegebenen Fragen vorhanden. Bitte zuerst Inhalte seeden (npm run seed).
      </div>
    );
  }

  const question = questions[index];
  if (!question) {
    return (
      <div className="card space-y-3 text-center">
        <h1 className="text-xl font-bold">Diagnose abgeschlossen</h1>
        <p className="text-sm text-ink-600">Dein Kompetenzprofil und dein Tagesplan sind bereit.</p>
        <button className="btn-primary" onClick={() => { router.push('/dashboard'); router.refresh(); }}>
          Zum Lernstand
        </button>
      </div>
    );
  }

  const isLast = index === questions.length - 1;

  async function submit(answer: AnswerPayloadDto, meta: { helpLevel: number; confidence: string | null; timeTakenSeconds: number }): Promise<FeedbackDto | null> {
    const res = await fetch('/api/attempt', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        questionId: question!.id,
        context: 'diagnose',
        answer,
        helpLevel: 0,
        confidence: meta.confidence,
        timeTakenSeconds: meta.timeTakenSeconds,
        diagnosisComplete: isLast,
      }),
    });
    if (!res.ok) return null;
    return res.json() as Promise<FeedbackDto>;
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-1 flex items-center justify-between text-sm text-ink-600">
          <span className="font-semibold">Eingangsdiagnose</span>
          <span>{index + 1} / {questions.length}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-ink-200">
          <div className="h-full bg-brand-500 transition-all" style={{ width: `${(index / questions.length) * 100}%` }} />
        </div>
      </div>
      <TaskCard
        question={question}
        allowHelp={false}
        askConfidence
        onSubmit={submit}
        onNext={() => setIndex((i) => i + 1)}
      />
    </div>
  );
}
