'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface EditableQuestion {
  id: string;
  prompt: string;
  context: string | null;
  modelAnswer: string;
  status: string;
  difficulty: number;
  examRelevance: number;
  points: number;
  qtype: string;
  operator: string;
  sourceRef: string;
  sourceLevel: number;
  version: number;
  criteria: { id: string; text: string; points: number; required: boolean }[];
  choices: { id: string; text: string; correct: boolean }[];
}

const STATUSES = ['entwurf', 'fachlich_geprueft', 'didaktisch_geprueft', 'freigegeben', 'gesperrt', 'archiviert'];

export function QuestionEditor({ question }: { question: EditableQuestion }) {
  const router = useRouter();
  const [prompt, setPrompt] = useState(question.prompt);
  const [context, setContext] = useState(question.context ?? '');
  const [modelAnswer, setModelAnswer] = useState(question.modelAnswer);
  const [status, setStatus] = useState(question.status);
  const [difficulty, setDifficulty] = useState(question.difficulty);
  const [examRelevance, setExamRelevance] = useState(question.examRelevance);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    setMsg(null);
    const res = await fetch(`/api/admin/question/${question.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        prompt,
        context: context.trim() === '' ? null : context,
        model_answer: modelAnswer,
        status,
        difficulty,
        exam_relevance: examRelevance,
      }),
    });
    setBusy(false);
    if (res.ok) {
      setMsg('Gespeichert — Version erhöht.');
      router.refresh();
    } else {
      const data = (await res.json()) as { error?: string };
      setMsg(data.error ?? 'Fehler beim Speichern');
    }
  }

  return (
    <div className="card space-y-4">
      <div className="flex flex-wrap gap-2 text-xs text-ink-500">
        <span className="badge bg-ink-100">{question.id}</span>
        <span className="badge bg-ink-100">{question.qtype}</span>
        <span className="badge bg-ink-100">{question.operator}</span>
        <span className="badge bg-ink-100">Quelle: {question.sourceRef} (L{question.sourceLevel})</span>
        <span className="badge bg-ink-100">v{question.version}</span>
        <span className="badge bg-ink-100">{question.points} P.</span>
      </div>
      <div>
        <label className="label">Aufgabenstellung</label>
        <textarea className="input" rows={3} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      </div>
      <div>
        <label className="label">Kontext / Projektbeschreibung</label>
        <textarea className="input" rows={3} value={context} onChange={(e) => setContext(e.target.value)} />
      </div>
      <div>
        <label className="label">Musterlösung</label>
        <textarea className="input" rows={4} value={modelAnswer} onChange={(e) => setModelAnswer(e.target.value)} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="label">Status</label>
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Schwierigkeit (1–5)</label>
          <input type="number" min={1} max={5} className="input" value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value))} />
        </div>
        <div>
          <label className="label">Prüfungsrelevanz (1–5)</label>
          <input type="number" min={1} max={5} className="input" value={examRelevance} onChange={(e) => setExamRelevance(Number(e.target.value))} />
        </div>
      </div>

      {question.choices.length > 0 && (
        <div>
          <label className="label">Antwortoptionen (nur Ansicht)</label>
          <ul className="space-y-1 text-sm">
            {question.choices.map((c) => (
              <li key={c.id} className={c.correct ? 'font-semibold text-emerald-700' : ''}>
                {c.id}) {c.text} {c.correct && '✓'}
              </li>
            ))}
          </ul>
        </div>
      )}

      {question.criteria.length > 0 && (
        <div>
          <label className="label">Erwartungshorizont (nur Ansicht)</label>
          <ul className="space-y-1 text-sm">
            {question.criteria.map((c) => (
              <li key={c.id}>
                {c.id}: {c.text} — {c.points} P.{c.required ? ' (Pflicht)' : ''}
              </li>
            ))}
          </ul>
        </div>
      )}

      {msg && <p className="text-sm text-ink-600">{msg}</p>}
      <div className="flex justify-end">
        <button className="btn-primary" onClick={save} disabled={busy}>
          {busy ? 'Speichert…' : 'Speichern'}
        </button>
      </div>
    </div>
  );
}
