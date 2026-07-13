/**
 * Zod-Schemas für Seed-JSON-Dateien (seed/content/*.json).
 * Jede Datei wird beim Seeden validiert — fehlerhafte Inhalte brechen den Seed ab.
 */
import { z } from 'zod';
import {
  MAIN_AREAS,
  OPERATORS,
  QUESTION_TYPES,
  QUESTION_FAMILIES,
  ERROR_CODES,
  CONTENT_STATUSES,
} from './types';

export const zErrorCode = z.enum(ERROR_CODES);

export const zCompetencySeed = z.object({
  id: z.string().regex(/^(BAS|PLA|TKW|TKD|BPH|SAN|DGA|FBE|SON)-\d{3}$/),
  parent_id: z.string().nullable().default(null),
  main_area: z.enum(MAIN_AREAS),
  topic: z.string().min(2),
  title: z.string().min(3),
  description: z.string().min(5),
  prerequisites: z.array(z.string()).default([]),
  exam_relevance: z.number().int().min(1).max(5),
  dependency_value: z.number().int().min(1).max(3),
  points_potential: z.number().int().min(1).max(5),
  learning_effort: z.number().int().min(1).max(5),
  criticality: z.number().int().min(0).max(1).default(0),
  mastery_threshold: z.number().min(0.4).max(1).default(0.7),
  status: z.enum(CONTENT_STATUSES).default('freigegeben'),
});
export type CompetencySeed = z.infer<typeof zCompetencySeed>;

export const zChoiceSeed = z.object({
  id: z.string().regex(/^[a-e]$/),
  text: z.string().min(1),
  correct: z.boolean(),
  error_code: zErrorCode.optional(),
  explanation: z.string().optional(),
});

export const zCriterionSeed = z.object({
  id: z.string().min(1),
  text: z.string().min(3),
  points: z.number().min(0.5).max(10),
  required: z.boolean().default(false),
  keywords: z.array(z.string()).min(1),
  synonyms: z.array(z.string()).default([]),
  misconception_codes: z.array(zErrorCode).default([]),
});

export const zQuestionSeed = z
  .object({
    id: z.string().regex(/^Q-(BAS|PLA|TKW|TKD|BPH|SAN|DGA|FBE|SON)-\d{3}-[A-Z0-9]+$/),
    source_ref: z.string().min(2),
    source_level: z.number().int().min(1).max(6),
    exam_part: z.enum(['tk', 'san']),
    competency_ids: z.array(z.string()).min(1),
    family: z.enum(QUESTION_FAMILIES),
    operator: z.enum(OPERATORS),
    qtype: z.enum(QUESTION_TYPES),
    difficulty: z.number().int().min(1).max(5),
    exam_relevance: z.number().int().min(1).max(5),
    time_seconds: z.number().int().min(20).max(1800),
    points: z.number().min(1).max(20),
    prompt: z.string().min(10),
    context: z.string().nullable().default(null),
    choices: z.array(zChoiceSeed).default([]),
    number_answer: z
      .object({
        value: z.number(),
        unit: z.string(),
        tolerance: z.number().min(0),
        solution_path: z.string().optional(),
      })
      .nullable()
      .default(null),
    ordering_solution: z.array(z.string().min(2)).nullable().default(null),
    matching_pairs: z
      .array(z.object({ left: z.string().min(1), right: z.string().min(1) }))
      .nullable()
      .default(null),
    model_answer: z.string().min(5),
    criteria: z.array(zCriterionSeed).default([]),
    typical_errors: z.array(z.string()).default([]),
    status: z.enum(CONTENT_STATUSES).default('freigegeben'),
    version: z.number().int().min(1).default(1),
  })
  .superRefine((q, ctx) => {
    const isChoice = q.qtype === 'single_choice' || q.qtype === 'multiple_choice';
    if (isChoice) {
      if (q.choices.length < 3) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${q.id}: choice-Frage braucht >=3 Optionen` });
      }
      const correct = q.choices.filter((c) => c.correct).length;
      if (q.qtype === 'single_choice' && correct !== 1) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${q.id}: single_choice braucht genau 1 richtige Option (hat ${correct})` });
      }
      if (q.qtype === 'multiple_choice' && correct < 1) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${q.id}: multiple_choice braucht >=1 richtige Option` });
      }
    }
    if (q.qtype === 'number_unit' && !q.number_answer) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${q.id}: number_unit braucht number_answer` });
    }
    if (q.qtype === 'ordering' && (!q.ordering_solution || q.ordering_solution.length < 3)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${q.id}: ordering braucht ordering_solution mit >=3 Schritten` });
    }
    if (q.qtype === 'matching' && (!q.matching_pairs || q.matching_pairs.length < 3)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${q.id}: matching braucht >=3 Paare` });
    }
    const freeText = ['short_text', 'long_text', 'plan_question', 'error_finder', 'system_selection', 'procedure', 'project'];
    if (freeText.includes(q.qtype) && q.criteria.length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${q.id}: freie Frage braucht >=2 Bewertungskriterien` });
    }
    if (q.criteria.length > 0) {
      const critSum = q.criteria.reduce((s, c) => s + c.points, 0);
      if (Math.abs(critSum - q.points) > 0.01) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${q.id}: Kriteriensumme ${critSum} != points ${q.points}` });
      }
    }
  });
export type QuestionSeed = z.infer<typeof zQuestionSeed>;

export const zCompetencyFile = z.object({ competencies: z.array(zCompetencySeed).min(1) });
export const zQuestionFile = z.object({ questions: z.array(zQuestionSeed).min(1) });
