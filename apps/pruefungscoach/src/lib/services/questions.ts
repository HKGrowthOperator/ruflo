import { getDb } from '../db';
import type { AnswerCriterion, Choice, ErrorCode, NumberAnswer, Question } from '../domain/types';

interface QuestionRow {
  id: string;
  source_id: string | null;
  source_level: number;
  exam_part: 'tk' | 'san';
  family: Question['family'];
  operator: Question['operator'];
  qtype: Question['qtype'];
  difficulty: number;
  exam_relevance: number;
  time_seconds: number;
  points: number;
  prompt: string;
  context: string | null;
  number_answer: string | null;
  ordering_solution: string | null;
  matching_pairs: string | null;
  model_answer: string;
  typical_errors: string;
  status: Question['status'];
  version: number;
}

export function loadQuestion(id: string): Question | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM questions WHERE id = ?').get(id) as QuestionRow | undefined;
  if (!row) return null;
  const choices = db.prepare('SELECT id, text, correct, error_code, explanation FROM choices WHERE question_id = ? ORDER BY id').all(id) as {
    id: string; text: string; correct: number; error_code: string | null; explanation: string | null;
  }[];
  const criteria = db.prepare('SELECT * FROM answer_criteria WHERE question_id = ? ORDER BY id').all(id) as {
    id: string; text: string; points: number; required: number; keywords: string; synonyms: string; misconception_codes: string;
  }[];
  const comps = db.prepare('SELECT competency_id, is_primary FROM question_competencies WHERE question_id = ? ORDER BY is_primary DESC').all(id) as {
    competency_id: string; is_primary: number;
  }[];
  return {
    id: row.id,
    sourceRef: row.source_id ?? 'unbekannt',
    sourceLevel: row.source_level as Question['sourceLevel'],
    examPart: row.exam_part,
    competencyIds: comps.map((c) => c.competency_id),
    family: row.family,
    operator: row.operator,
    qtype: row.qtype,
    difficulty: row.difficulty,
    examRelevance: row.exam_relevance,
    timeSeconds: row.time_seconds,
    points: row.points,
    prompt: row.prompt,
    context: row.context,
    choices: choices.map<Choice>((c) => ({
      id: c.id,
      text: c.text,
      correct: c.correct === 1,
      errorCode: (c.error_code as ErrorCode | null) ?? undefined,
      explanation: c.explanation ?? undefined,
    })),
    numberAnswer: row.number_answer ? (JSON.parse(row.number_answer) as NumberAnswer) : null,
    orderingSolution: row.ordering_solution ? (JSON.parse(row.ordering_solution) as string[]) : null,
    matchingPairs: row.matching_pairs ? (JSON.parse(row.matching_pairs) as { left: string; right: string }[]) : null,
    modelAnswer: row.model_answer,
    criteria: criteria.map<AnswerCriterion>((c) => ({
      id: c.id,
      text: c.text,
      points: c.points,
      required: c.required === 1,
      keywords: JSON.parse(c.keywords) as string[],
      synonyms: JSON.parse(c.synonyms) as string[],
      misconceptionCodes: JSON.parse(c.misconception_codes) as ErrorCode[],
    })),
    typicalErrors: JSON.parse(row.typical_errors) as string[],
    status: row.status,
    version: row.version,
  };
}

/** Für die Auslieferung an den Client: keine Lösungen mitschicken. */
export interface PublicQuestion {
  id: string;
  qtype: Question['qtype'];
  operator: Question['operator'];
  family: Question['family'];
  examPart: 'tk' | 'san';
  difficulty: number;
  points: number;
  timeSeconds: number;
  prompt: string;
  context: string | null;
  choices: { id: string; text: string }[];
  orderingItems: string[] | null; // gemischte Schritte
  matchingLeft: string[] | null;
  matchingRight: string[] | null;
  numberUnit: string | null; // erwartete Einheit wird NICHT verraten — nur ob Einheit nötig ist
  primaryCompetencyId: string | null;
}

/** Deterministisches Mischen (seeded), damit Reihenfolgen stabil pro Frage sind. */
function seededShuffle<T>(arr: T[], seedStr: string): T[] {
  let seed = 0;
  for (const ch of seedStr) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    const j = seed % (i + 1);
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function toPublicQuestion(q: Question): PublicQuestion {
  return {
    id: q.id,
    qtype: q.qtype,
    operator: q.operator,
    family: q.family,
    examPart: q.examPart,
    difficulty: q.difficulty,
    points: q.points,
    timeSeconds: q.timeSeconds,
    prompt: q.prompt,
    context: q.context,
    choices: q.choices.map((c) => ({ id: c.id, text: c.text })),
    orderingItems: q.orderingSolution ? seededShuffle(q.orderingSolution, q.id) : null,
    matchingLeft: q.matchingPairs ? q.matchingPairs.map((p) => p.left) : null,
    matchingRight: q.matchingPairs ? seededShuffle(q.matchingPairs.map((p) => p.right), q.id) : null,
    numberUnit: q.qtype === 'number_unit' ? 'erforderlich' : null,
    primaryCompetencyId: q.competencyIds[0] ?? null,
  };
}
