/**
 * Deterministische Bewertung (Masterbrief §3.3, §10, §12).
 * Punkte summiert IMMER der Code — die KI liefert höchstens Kriterien-Treffer.
 */
import type { AnswerCriterion, Choice, ErrorCode, NumberAnswer, Question } from './types';

export interface GradeOutcome {
  correct: boolean;
  partial: boolean;
  pointsAwarded: number;
  pointsMax: number;
  errorCodes: ErrorCode[];
  /** §12: 0 nicht verwertbar, 1 Ansatz, 2 Kern vorhanden, 3 vollständig */
  level: 0 | 1 | 2 | 3;
  metCriteria: string[]; // Kriterien-IDs (freie Antworten)
  feedback: string;
}

export type AnswerPayload =
  | { kind: 'choice'; selected: string[] }
  | { kind: 'number'; value: number | null; unit: string }
  | { kind: 'ordering'; order: string[] }
  | { kind: 'matching'; pairs: { left: string; right: string }[] }
  | { kind: 'text'; text: string };

const round2 = (x: number) => Math.round(x * 100) / 100;

function levelFromFraction(frac: number, requiredMet: boolean): 0 | 1 | 2 | 3 {
  if (frac >= 0.95 && requiredMet) return 3;
  if (frac >= 0.6 && requiredMet) return 2;
  if (frac > 0.15) return 1;
  return 0;
}

// ---------------------------------------------------------------------------
// Auswahlaufgaben
// ---------------------------------------------------------------------------

export function gradeChoice(question: Pick<Question, 'points' | 'qtype'>, choices: Choice[], selected: string[]): GradeOutcome {
  const correctIds = choices.filter((c) => c.correct).map((c) => c.id);
  const sel = new Set(selected);
  const errorCodes: ErrorCode[] = [];

  if (question.qtype === 'single_choice') {
    const pick = selected[0];
    const isCorrect = pick !== undefined && correctIds.includes(pick);
    if (!isCorrect && pick !== undefined) {
      const chosen = choices.find((c) => c.id === pick);
      if (chosen?.errorCode) errorCodes.push(chosen.errorCode);
      else errorCodes.push('F1');
    }
    return {
      correct: isCorrect,
      partial: false,
      pointsAwarded: isCorrect ? question.points : 0,
      pointsMax: question.points,
      errorCodes,
      level: isCorrect ? 3 : 0,
      metCriteria: [],
      feedback: '',
    };
  }

  // multiple_choice: (richtig gewählt − falsch gewählt) / Anzahl richtiger, min 0
  const hits = correctIds.filter((id) => sel.has(id)).length;
  const wrong = [...sel].filter((id) => !correctIds.includes(id));
  for (const w of wrong) {
    const chosen = choices.find((c) => c.id === w);
    if (chosen?.errorCode) errorCodes.push(chosen.errorCode);
  }
  const frac = Math.max(0, (hits - wrong.length) / correctIds.length);
  const missedAll = hits < correctIds.length;
  if (missedAll && frac > 0) errorCodes.push('F10');
  const points = round2(frac * question.points);
  return {
    correct: frac >= 0.999,
    partial: frac > 0 && frac < 0.999,
    pointsAwarded: points,
    pointsMax: question.points,
    errorCodes: dedupe(errorCodes),
    level: levelFromFraction(frac, true),
    metCriteria: [],
    feedback: '',
  };
}

// ---------------------------------------------------------------------------
// Zahl mit Einheit
// ---------------------------------------------------------------------------

const normalizeUnit = (u: string) =>
  u
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace('²', '2')
    .replace('³', '3')
    .replace('qm', 'm2')
    .replace('m^2', 'm2')
    .replace('m^3', 'm3');

export function gradeNumber(question: Pick<Question, 'points'>, expected: NumberAnswer, value: number | null, unit: string): GradeOutcome {
  const errorCodes: ErrorCode[] = [];
  const unitOk = normalizeUnit(unit) === normalizeUnit(expected.unit);
  const valueOk = value !== null && Math.abs(value - expected.value) <= expected.tolerance;

  let points = 0;
  if (valueOk && unitOk) points = question.points;
  else if (valueOk && !unitOk) {
    points = round2(question.points * 0.5);
    errorCodes.push('F14');
  } else if (!valueOk) {
    errorCodes.push('F9');
    if (value !== null && expected.value !== 0) {
      const ratio = Math.abs(value / expected.value);
      // Größenordnungs-/Methodenfehler statt Rundungsfehler
      if (ratio > 3 || ratio < 1 / 3) {
        errorCodes.pop();
        errorCodes.push('F8');
      }
    }
    if (!unitOk) errorCodes.push('F14');
  }
  const frac = points / question.points;
  return {
    correct: valueOk && unitOk,
    partial: points > 0 && points < question.points,
    pointsAwarded: points,
    pointsMax: question.points,
    errorCodes: dedupe(errorCodes),
    level: levelFromFraction(frac, valueOk),
    metCriteria: [],
    feedback: expected.solutionPath ?? '',
  };
}

// ---------------------------------------------------------------------------
// Reihenfolge / Zuordnung
// ---------------------------------------------------------------------------

export function gradeOrdering(question: Pick<Question, 'points'>, solution: string[], order: string[]): GradeOutcome {
  const n = solution.length;
  let inPosition = 0;
  for (let i = 0; i < n; i++) if (order[i] === solution[i]) inPosition++;
  // Nachbarschaftsmaß: korrekte Aufeinanderfolgen zählen halb
  let adjacency = 0;
  for (let i = 0; i < n - 1; i++) {
    const a = solution[i];
    const b = solution[i + 1];
    const ia = order.indexOf(a as string);
    if (ia >= 0 && order[ia + 1] === b) adjacency++;
  }
  const frac = Math.max(inPosition / n, adjacency / (n - 1) * 0.8);
  const points = round2(frac * question.points);
  const errorCodes: ErrorCode[] = frac >= 0.999 ? [] : frac >= 0.5 ? ['F10'] : ['F4'];
  return {
    correct: frac >= 0.999,
    partial: frac > 0 && frac < 0.999,
    pointsAwarded: points,
    pointsMax: question.points,
    errorCodes,
    level: levelFromFraction(frac, true),
    metCriteria: [],
    feedback: '',
  };
}

export function gradeMatching(question: Pick<Question, 'points'>, solution: { left: string; right: string }[], pairs: { left: string; right: string }[]): GradeOutcome {
  const map = new Map(solution.map((p) => [p.left, p.right]));
  let hits = 0;
  for (const p of pairs) if (map.get(p.left) === p.right) hits++;
  const frac = hits / solution.length;
  const points = round2(frac * question.points);
  return {
    correct: frac >= 0.999,
    partial: frac > 0 && frac < 0.999,
    pointsAwarded: points,
    pointsMax: question.points,
    errorCodes: frac >= 0.999 ? [] : ['F2'],
    level: levelFromFraction(frac, true),
    metCriteria: [],
    feedback: '',
  };
}

// ---------------------------------------------------------------------------
// Freie Antworten – deterministischer Kriterien-Matcher (Fallback ohne KI)
// ---------------------------------------------------------------------------

const normalizeText = (t: string) =>
  t
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export function criterionMet(criterion: AnswerCriterion, answerNormalized: string): boolean {
  const terms = [...criterion.keywords, ...criterion.synonyms].map(normalizeText).filter(Boolean);
  return terms.some((t) => answerNormalized.includes(t));
}

/**
 * Bewertet eine freie Antwort über Kriterien-Treffer. Der Code summiert die
 * Punkte (§12); dieselbe Funktion verarbeitet auch KI-gelieferte Treffer.
 */
export function gradeFreeTextFromHits(
  question: Pick<Question, 'points'>,
  criteria: AnswerCriterion[],
  metIds: Set<string>,
  detectedMisconceptions: ErrorCode[] = [],
): GradeOutcome {
  let points = 0;
  const met: string[] = [];
  for (const c of criteria) {
    if (metIds.has(c.id)) {
      points += c.points;
      met.push(c.id);
    }
  }
  points = round2(Math.min(points, question.points));
  const requiredMet = criteria.filter((c) => c.required).every((c) => metIds.has(c.id));
  const frac = question.points > 0 ? points / question.points : 0;

  const errorCodes: ErrorCode[] = [...detectedMisconceptions];
  if (frac < 0.999 && frac >= 0.3) errorCodes.push('F10');
  if (frac < 0.3 && frac > 0) errorCodes.push('F11');
  if (frac === 0) errorCodes.push('F1');

  return {
    correct: frac >= 0.999 && requiredMet,
    partial: frac > 0 && frac < 0.999,
    pointsAwarded: points,
    pointsMax: question.points,
    errorCodes: dedupe(errorCodes),
    level: levelFromFraction(frac, requiredMet),
    metCriteria: met,
    feedback: '',
  };
}

export function gradeFreeTextDeterministic(question: Pick<Question, 'points'>, criteria: AnswerCriterion[], answer: string): GradeOutcome {
  const norm = normalizeText(answer);
  if (norm.length < 3) {
    return {
      correct: false,
      partial: false,
      pointsAwarded: 0,
      pointsMax: question.points,
      errorCodes: ['F1'],
      level: 0,
      metCriteria: [],
      feedback: '',
    };
  }
  const met = new Set<string>();
  for (const c of criteria) if (criterionMet(c, norm)) met.add(c.id);
  return gradeFreeTextFromHits(question, criteria, met);
}

function dedupe<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}
