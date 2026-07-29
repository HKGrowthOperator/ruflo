'use client';

/**
 * Eine Aufgabe pro Ansicht (§22): Operator, Kontext, Antworteingabe je Typ,
 * Antwortsicherheit (§5), gestufte Hilfen (§18) und Feedback-Anzeige.
 */
import { useEffect, useMemo, useRef, useState } from 'react';

export interface PublicQuestionDto {
  id: string;
  qtype: string;
  operator: string;
  family: string;
  examPart: string;
  difficulty: number;
  points: number;
  timeSeconds: number;
  prompt: string;
  context: string | null;
  choices: { id: string; text: string }[];
  orderingItems: string[] | null;
  matchingLeft: string[] | null;
  matchingRight: string[] | null;
  numberUnit: string | null;
}

export type AnswerPayloadDto =
  | { kind: 'choice'; selected: string[] }
  | { kind: 'number'; value: number | null; unit: string }
  | { kind: 'ordering'; order: string[] }
  | { kind: 'matching'; pairs: { left: string; right: string }[] }
  | { kind: 'text'; text: string };

export interface FeedbackDto {
  outcome: {
    correct: boolean;
    partial: boolean;
    pointsAwarded: number;
    pointsMax: number;
    errorCodes: string[];
    level: number;
  };
  aiFeedback: string | null;
  modelAnswer: string;
  choiceExplanations: { id: string; text: string; correct: boolean; explanation: string | null }[];
  masteryAfter: number;
  statusAfter: string;
}

const OPERATOR_LABELS: Record<string, string> = {
  nennen: 'Nennen', beschreiben: 'Beschreiben', erklaeren: 'Erklären', begruenden: 'Begründen',
  unterscheiden: 'Unterscheiden', bestimmen: 'Bestimmen', berechnen: 'Berechnen', beurteilen: 'Beurteilen',
};

const CONFIDENCE_OPTIONS = [
  { value: 'geraten', label: 'Geraten' },
  { value: 'eher_unsicher', label: 'Eher unsicher' },
  { value: 'teilweise_sicher', label: 'Teilweise sicher' },
  { value: 'sicher', label: 'Sicher' },
  { value: 'sehr_sicher', label: 'Sehr sicher' },
] as const;

interface TaskCardProps {
  question: PublicQuestionDto;
  allowHelp: boolean;
  askConfidence: boolean;
  /** null = Antwort nur einsammeln (Simulation), sonst Submit-Handler mit Feedback */
  onSubmit: (answer: AnswerPayloadDto, meta: { helpLevel: number; confidence: string | null; timeTakenSeconds: number }) => Promise<FeedbackDto | null>;
  onNext: () => void;
  /** Autosave-Handler für Simulationsmodus */
  onDraftChange?: (answer: AnswerPayloadDto) => void;
  initialAnswer?: AnswerPayloadDto | null;
}

export function TaskCard({ question, allowHelp, askConfidence, onSubmit, onNext, onDraftChange, initialAnswer }: TaskCardProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [numberValue, setNumberValue] = useState('');
  const [numberUnit, setNumberUnit] = useState('');
  const [order, setOrder] = useState<string[]>(question.orderingItems ?? []);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [text, setText] = useState('');
  const [confidence, setConfidence] = useState<string | null>(null);
  const [helpLevel, setHelpLevel] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackDto | null>(null);
  const [busy, setBusy] = useState(false);
  const startRef = useRef(Date.now());

  // Reset bei Fragenwechsel
  useEffect(() => {
    setSelected([]); setNumberValue(''); setNumberUnit('');
    setOrder(question.orderingItems ?? []);
    setMatches({}); setText(''); setConfidence(null);
    setHelpLevel(0); setHint(null); setFeedback(null); setBusy(false);
    startRef.current = Date.now();
    if (initialAnswer) {
      if (initialAnswer.kind === 'choice') setSelected(initialAnswer.selected);
      if (initialAnswer.kind === 'number') { setNumberValue(initialAnswer.value?.toString() ?? ''); setNumberUnit(initialAnswer.unit); }
      if (initialAnswer.kind === 'ordering' && initialAnswer.order.length) setOrder(initialAnswer.order);
      if (initialAnswer.kind === 'matching') setMatches(Object.fromEntries(initialAnswer.pairs.map((p) => [p.left, p.right])));
      if (initialAnswer.kind === 'text') setText(initialAnswer.text);
    }
  }, [question.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const answer = useMemo<AnswerPayloadDto>(() => {
    switch (question.qtype) {
      case 'single_choice':
      case 'multiple_choice':
        return { kind: 'choice', selected };
      case 'number_unit':
        return { kind: 'number', value: numberValue.trim() === '' ? null : Number(numberValue.replace(',', '.')), unit: numberUnit };
      case 'ordering':
        return { kind: 'ordering', order };
      case 'matching':
        return { kind: 'matching', pairs: (question.matchingLeft ?? []).map((l) => ({ left: l, right: matches[l] ?? '' })) };
      default:
        return { kind: 'text', text };
    }
  }, [question, selected, numberValue, numberUnit, order, matches, text]);

  useEffect(() => {
    onDraftChange?.(answer);
  }, [answer]); // eslint-disable-line react-hooks/exhaustive-deps

  const answered =
    (answer.kind === 'choice' && answer.selected.length > 0) ||
    (answer.kind === 'number' && answer.value !== null) ||
    (answer.kind === 'ordering') ||
    (answer.kind === 'matching' && Object.keys(matches).length > 0) ||
    (answer.kind === 'text' && answer.text.trim().length > 0);

  async function loadHint(level: number) {
    setHelpLevel(level);
    const res = await fetch(`/api/question/${question.id}/hint?level=${level}`);
    if (res.ok) {
      const data = (await res.json()) as { hint: string };
      setHint(data.hint);
    }
  }

  async function submit() {
    if (busy) return;
    setBusy(true);
    const timeTakenSeconds = Math.round((Date.now() - startRef.current) / 1000);
    const fb = await onSubmit(answer, { helpLevel, confidence, timeTakenSeconds });
    setFeedback(fb);
    setBusy(false);
    if (!fb) onNext();
  }

  const toggleChoice = (id: string) => {
    if (question.qtype === 'single_choice') setSelected([id]);
    else setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const move = (idx: number, dir: -1 | 1) => {
    setOrder((prev) => {
      const next = [...prev];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[idx], next[j]] = [next[j]!, next[idx]!];
      return next;
    });
  };

  return (
    <div className="card space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="badge bg-brand-100 text-brand-800">{OPERATOR_LABELS[question.operator] ?? question.operator}</span>
        <span className="badge bg-ink-100 text-ink-700">{question.points} P.</span>
        <span className="badge bg-ink-100 text-ink-700">~{Math.max(1, Math.round(question.timeSeconds / 60))} min</span>
        <span className="badge bg-ink-100 text-ink-700">{question.examPart === 'tk' ? 'Trockenbaukonstruktionen' : 'Sanieren/Instandsetzen'}</span>
      </div>

      {question.context && (
        <div className="rounded-xl bg-ink-100 p-3 text-sm leading-relaxed text-ink-800 whitespace-pre-wrap">{question.context}</div>
      )}

      <p className="text-base font-medium leading-relaxed whitespace-pre-wrap">{question.prompt}</p>

      {/* Antwortbereich */}
      {!feedback && (
        <div className="space-y-3">
          {(question.qtype === 'single_choice' || question.qtype === 'multiple_choice') && (
            <div className="space-y-2">
              {question.choices.map((c) => (
                <button
                  key={c.id}
                  onClick={() => toggleChoice(c.id)}
                  className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                    selected.includes(c.id)
                      ? 'border-brand-500 bg-brand-50 font-medium'
                      : 'border-ink-200 bg-white hover:border-ink-300'
                  }`}
                >
                  <span className="mr-2 font-semibold uppercase">{c.id})</span>
                  {c.text}
                </button>
              ))}
              {question.qtype === 'multiple_choice' && (
                <p className="text-xs text-ink-500">Mehrere Antworten möglich.</p>
              )}
            </div>
          )}

          {question.qtype === 'number_unit' && (
            <div className="flex gap-2">
              <input className="input flex-1" inputMode="decimal" placeholder="Wert" value={numberValue} onChange={(e) => setNumberValue(e.target.value)} />
              <input className="input w-32" placeholder="Einheit" value={numberUnit} onChange={(e) => setNumberUnit(e.target.value)} />
            </div>
          )}

          {question.qtype === 'ordering' && (
            <ol className="space-y-2">
              {order.map((step, i) => (
                <li key={step} className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm">
                  <span className="w-6 shrink-0 text-center font-bold text-ink-400">{i + 1}.</span>
                  <span className="flex-1">{step}</span>
                  <button className="btn-ghost px-2 py-1" onClick={() => move(i, -1)} aria-label="nach oben">↑</button>
                  <button className="btn-ghost px-2 py-1" onClick={() => move(i, 1)} aria-label="nach unten">↓</button>
                </li>
              ))}
            </ol>
          )}

          {question.qtype === 'matching' && (
            <div className="space-y-2">
              {(question.matchingLeft ?? []).map((l) => (
                <div key={l} className="flex items-center gap-2">
                  <span className="flex-1 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm">{l}</span>
                  <select className="input flex-1" value={matches[l] ?? ''} onChange={(e) => setMatches((m) => ({ ...m, [l]: e.target.value }))}>
                    <option value="">– zuordnen –</option>
                    {(question.matchingRight ?? []).map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          {['short_text', 'long_text', 'plan_question', 'error_finder', 'system_selection', 'procedure', 'project'].includes(question.qtype) && (
            <textarea
              className="input min-h-32"
              placeholder="Deine Antwort — Fachbegriffe, Begründung, ggf. Reihenfolge…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={question.qtype === 'short_text' ? 4 : 8}
            />
          )}

          {hint && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 whitespace-pre-wrap">
              {hint}
            </div>
          )}

          {askConfidence && answered && (
            <div>
              <p className="label">Wie sicher bist du?</p>
              <div className="flex flex-wrap gap-1.5">
                {CONFIDENCE_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => setConfidence(o.value)}
                    className={`badge border px-3 py-1.5 ${
                      confidence === o.value ? 'border-brand-500 bg-brand-50 text-brand-800' : 'border-ink-200 bg-white text-ink-600'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 pt-1">
            {allowHelp ? (
              <button className="btn-secondary" onClick={() => loadHint(Math.min(5, helpLevel + 1))} disabled={helpLevel >= 5}>
                {helpLevel === 0 ? 'Hilfe' : `Mehr Hilfe (${helpLevel}/5)`}
              </button>
            ) : <span />}
            <button className="btn-primary" onClick={submit} disabled={!answered || busy || (askConfidence && !confidence)}>
              {busy ? 'Wird bewertet…' : 'Antwort abgeben'}
            </button>
          </div>
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div className="space-y-3">
          <div
            className={`rounded-xl p-3 text-sm font-medium ${
              feedback.outcome.correct
                ? 'bg-emerald-50 text-emerald-900'
                : feedback.outcome.partial
                  ? 'bg-amber-50 text-amber-900'
                  : 'bg-red-50 text-red-900'
            }`}
          >
            {feedback.outcome.correct ? 'Richtig' : feedback.outcome.partial ? 'Teilweise richtig' : 'Nicht richtig'} ·{' '}
            {feedback.outcome.pointsAwarded} / {feedback.outcome.pointsMax} Punkte
            {feedback.aiFeedback && <p className="mt-1 font-normal">{feedback.aiFeedback}</p>}
          </div>

          {feedback.choiceExplanations.length > 0 && (
            <div className="space-y-1.5">
              {feedback.choiceExplanations.map((c) => (
                <div
                  key={c.id}
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    c.correct ? 'border-emerald-300 bg-emerald-50' : 'border-ink-200 bg-white'
                  }`}
                >
                  <span className="mr-1 font-semibold uppercase">{c.id})</span>
                  {c.text}
                  {c.explanation && <p className="mt-0.5 text-xs text-ink-600">{c.explanation}</p>}
                </div>
              ))}
            </div>
          )}

          <details className="rounded-xl border border-ink-200 bg-ink-50 p-3 text-sm" open={!feedback.outcome.correct}>
            <summary className="cursor-pointer font-semibold text-ink-800">Musterlösung</summary>
            <p className="mt-2 whitespace-pre-wrap leading-relaxed text-ink-800">{feedback.modelAnswer}</p>
          </details>

          <div className="flex justify-end">
            <button className="btn-primary" onClick={onNext}>Weiter</button>
          </div>
        </div>
      )}
    </div>
  );
}
