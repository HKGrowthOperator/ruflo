/**
 * Zentrale Versuchs-Verarbeitung: bewerten → speichern → Mastery/Status →
 * Wiederholungstermin → Fehlergedächtnis. Alles deterministisch außer der
 * optionalen KI-Kriterienzuordnung.
 */
import { getDb } from '../db';
import { evaluateFreeText, misconceptionsFromMissedCriteria } from '../ai/evaluate';
import {
  applyAttempt,
  deriveStatus,
  INITIAL_SCORES,
  type CompetencyScores,
} from '../domain/mastery';
import { daysUntil } from '../domain/modes';
import { estimateStage, nextReviewAt, stageAfterFailure, stageAfterSuccess } from '../domain/scheduler';
import {
  gradeChoice,
  gradeMatching,
  gradeNumber,
  gradeOrdering,
  type AnswerPayload,
  type GradeOutcome,
} from '../domain/scoring';
import type { AttemptResult, Confidence, ErrorCode, HelpLevel, Question } from '../domain/types';
import { loadQuestion } from './questions';

export interface SubmitAttemptInput {
  userId: number;
  questionId: string;
  context: 'diagnose' | 'session' | 'review' | 'simulation';
  answer: AnswerPayload;
  helpLevel: HelpLevel;
  confidence: Confidence | null;
  timeTakenSeconds: number;
  planItemId?: number;
  simId?: number;
  /** Simulation: nur speichern, nicht sofort bewerten (§20) */
  deferGrading?: boolean;
}

export interface AttemptFeedback {
  outcome: GradeOutcome;
  evalSource: 'ai' | 'deterministic';
  aiFeedback: string | null;
  modelAnswer: string;
  choiceExplanations: { id: string; text: string; correct: boolean; explanation: string | null }[];
  masteryAfter: number;
  statusAfter: string;
  nextReviewAt: string | null;
  attemptId: number;
}

export async function gradeAnswer(question: Question, answer: AnswerPayload): Promise<{ outcome: GradeOutcome; evalSource: 'ai' | 'deterministic'; aiFeedback: string | null }> {
  switch (question.qtype) {
    case 'single_choice':
    case 'multiple_choice': {
      const selected = answer.kind === 'choice' ? answer.selected : [];
      return { outcome: gradeChoice(question, question.choices, selected), evalSource: 'deterministic', aiFeedback: null };
    }
    case 'number_unit': {
      const a = answer.kind === 'number' ? answer : { value: null, unit: '' };
      if (!question.numberAnswer) throw new Error(`${question.id}: number_answer fehlt`);
      return { outcome: gradeNumber(question, question.numberAnswer, a.value, a.unit), evalSource: 'deterministic', aiFeedback: null };
    }
    case 'ordering': {
      const order = answer.kind === 'ordering' ? answer.order : [];
      if (!question.orderingSolution) throw new Error(`${question.id}: ordering_solution fehlt`);
      return { outcome: gradeOrdering(question, question.orderingSolution, order), evalSource: 'deterministic', aiFeedback: null };
    }
    case 'matching': {
      const pairs = answer.kind === 'matching' ? answer.pairs : [];
      if (!question.matchingPairs) throw new Error(`${question.id}: matching_pairs fehlen`);
      return { outcome: gradeMatching(question, question.matchingPairs, pairs), evalSource: 'deterministic', aiFeedback: null };
    }
    default: {
      // freie Antworttypen
      const text = answer.kind === 'text' ? answer.text : '';
      const evaluation = await evaluateFreeText(question, question.criteria, text);
      const missed = misconceptionsFromMissedCriteria(question.criteria, evaluation.outcome.metCriteria);
      evaluation.outcome.errorCodes = [...new Set([...evaluation.outcome.errorCodes, ...missed])];
      return { outcome: evaluation.outcome, evalSource: evaluation.evalSource, aiFeedback: evaluation.aiFeedback };
    }
  }
}

interface LearnerCompRow {
  status: string;
  recognition_score: number;
  recall_score: number;
  application_score: number;
  transfer_score: number;
  stability_score: number;
  speed_score: number;
  confidence_calibration: number;
  mastery: number;
  next_review_at: string | null;
  last_reviewed_at: string | null;
  attempt_count: number;
  independent_successes: number;
  helped_successes: number;
  incorrect_attempts: number;
}

export async function submitAttempt(input: SubmitAttemptInput): Promise<AttemptFeedback> {
  const db = getDb();
  const question = loadQuestion(input.questionId);
  if (!question) throw new Error(`Frage ${input.questionId} nicht gefunden`);

  const { outcome, evalSource, aiFeedback } = await gradeAnswer(question, input.answer);
  const overTime = input.timeTakenSeconds > question.timeSeconds * 1.5;

  const result: AttemptResult = {
    correct: outcome.correct,
    partial: outcome.partial,
    pointsAwarded: outcome.pointsAwarded,
    pointsMax: outcome.pointsMax,
    errorCodes: outcome.errorCodes,
    helpLevel: input.helpLevel,
    confidence: input.confidence,
    timeTakenSeconds: input.timeTakenSeconds,
    overTime,
  };

  const insertAttempt = db.prepare(`
    INSERT INTO attempts (user_id, question_id, context, plan_item_id, sim_id, answer_json, correct, partial,
      points_awarded, points_max, error_codes, help_level, confidence, time_taken_s, over_time, eval_source, eval_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const attemptRes = insertAttempt.run(
    input.userId,
    input.questionId,
    input.context,
    input.planItemId ?? null,
    input.simId ?? null,
    JSON.stringify(input.answer),
    outcome.correct ? 1 : 0,
    outcome.partial ? 1 : 0,
    outcome.pointsAwarded,
    outcome.pointsMax,
    JSON.stringify(outcome.errorCodes),
    input.helpLevel,
    input.confidence,
    input.timeTakenSeconds,
    overTime ? 1 : 0,
    evalSource,
    JSON.stringify({ level: outcome.level, metCriteria: outcome.metCriteria, aiFeedback }),
  );
  const attemptId = Number(attemptRes.lastInsertRowid);

  // --- Lernstand der Hauptkompetenz aktualisieren -----------------------------
  const primaryCompetencyId = question.competencyIds[0];
  let masteryAfter = 0;
  let statusAfter = 'unbekannt';
  let nextReview: string | null = null;

  if (primaryCompetencyId) {
    const profile = db.prepare('SELECT exam_date FROM learner_profiles WHERE user_id = ?').get(input.userId) as { exam_date: string } | undefined;
    const daysToExam = profile ? daysUntil(profile.exam_date) : 60;

    const row = db
      .prepare('SELECT * FROM learner_competencies WHERE user_id = ? AND competency_id = ?')
      .get(input.userId, primaryCompetencyId) as LearnerCompRow | undefined;

    const prev: CompetencyScores = row
      ? {
          recognitionScore: row.recognition_score,
          recallScore: row.recall_score,
          applicationScore: row.application_score,
          transferScore: row.transfer_score,
          stabilityScore: row.stability_score,
          speedScore: row.speed_score,
          confidenceCalibration: row.confidence_calibration,
          mastery: row.mastery,
          attemptCount: row.attempt_count,
          independentSuccesses: row.independent_successes,
          helpedSuccesses: row.helped_successes,
          incorrectAttempts: row.incorrect_attempts,
        }
      : { ...INITIAL_SCORES };

    const daysSinceLastReview = row?.last_reviewed_at
      ? Math.max(0, (Date.now() - new Date(row.last_reviewed_at).getTime()) / 86_400_000)
      : 0;

    const identicalRepeat =
      (db
        .prepare(
          `SELECT COUNT(*) n FROM attempts WHERE user_id = ? AND question_id = ? AND created_at > datetime('now', '-1 day') AND id != ?`,
        )
        .get(input.userId, input.questionId, attemptId) as { n: number }).n > 0;

    const next = applyAttempt(prev, {
      family: question.family,
      result,
      daysSinceLastReview,
      identicalRepeat,
    });

    const thresholdRow = db.prepare('SELECT mastery_threshold FROM competencies WHERE id = ?').get(primaryCompetencyId) as
      | { mastery_threshold: number }
      | undefined;
    const overdueDays = row?.next_review_at
      ? Math.max(0, (Date.now() - new Date(row.next_review_at).getTime()) / 86_400_000)
      : 0;
    const status = deriveStatus(next, { masteryThreshold: thresholdRow?.mastery_threshold ?? 0.7, overdueDays });

    // Wiederholungsstufe (§15)
    const success = result.pointsMax > 0 && result.pointsAwarded / result.pointsMax >= 0.6;
    const prevStage = estimateStage(prev.independentSuccesses, prev.incorrectAttempts);
    const stage = success ? stageAfterSuccess(prevStage, input.helpLevel) : stageAfterFailure(prevStage, outcome.errorCodes);
    nextReview = nextReviewAt({ daysToExam, stage, now: new Date() });

    db.prepare(`
      INSERT INTO learner_competencies (user_id, competency_id, status, recognition_score, recall_score,
        application_score, transfer_score, stability_score, speed_score, confidence_calibration, mastery,
        next_review_at, last_reviewed_at, attempt_count, independent_successes, helped_successes,
        incorrect_attempts, last_error_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, competency_id) DO UPDATE SET
        status = excluded.status, recognition_score = excluded.recognition_score,
        recall_score = excluded.recall_score, application_score = excluded.application_score,
        transfer_score = excluded.transfer_score, stability_score = excluded.stability_score,
        speed_score = excluded.speed_score, confidence_calibration = excluded.confidence_calibration,
        mastery = excluded.mastery, next_review_at = excluded.next_review_at,
        last_reviewed_at = excluded.last_reviewed_at, attempt_count = excluded.attempt_count,
        independent_successes = excluded.independent_successes, helped_successes = excluded.helped_successes,
        incorrect_attempts = excluded.incorrect_attempts, last_error_type = excluded.last_error_type
    `).run(
      input.userId,
      primaryCompetencyId,
      status,
      next.recognitionScore,
      next.recallScore,
      next.applicationScore,
      next.transferScore,
      next.stabilityScore,
      next.speedScore,
      next.confidenceCalibration,
      next.mastery,
      nextReview,
      next.attemptCount,
      next.independentSuccesses,
      next.helpedSuccesses,
      next.incorrectAttempts,
      outcome.errorCodes[0] ?? null,
    );

    masteryAfter = next.mastery;
    statusAfter = status;

    // --- Fehlergedächtnis (§9): Ursachen speichern -----------------------------
    if (!success && outcome.errorCodes.length > 0) {
      const critical = input.confidence === 'sehr_sicher' || outcome.errorCodes.includes('F16');
      const insErr = db.prepare(`
        INSERT INTO error_events (user_id, competency_id, question_id, attempt_id, error_code, severity,
          confidence, help_level, misconception, next_intervention)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const code of outcome.errorCodes) {
        insErr.run(
          input.userId,
          primaryCompetencyId,
          input.questionId,
          attemptId,
          code,
          critical ? 3 : outcome.pointsAwarded > 0 ? 1 : 2,
          input.confidence,
          input.helpLevel,
          null,
          critical ? 'sofortige Wiederholung mit Grundlagenlektion' : 'Wiederholung nach Plan',
        );
      }
    } else if (success) {
      // gelöste Fehlkonzepte als erledigt markieren
      db.prepare(
        `UPDATE error_events SET resolved_at = datetime('now') WHERE user_id = ? AND competency_id = ? AND resolved_at IS NULL`,
      ).run(input.userId, primaryCompetencyId);
    }

    // Plan-Item abhaken
    if (input.planItemId) {
      db.prepare(`UPDATE study_plan_items SET status = 'done', completed_at = datetime('now') WHERE id = ?`).run(input.planItemId);
    }
  }

  return {
    outcome,
    evalSource,
    aiFeedback,
    modelAnswer: question.modelAnswer,
    choiceExplanations: question.choices.map((c) => ({
      id: c.id,
      text: c.text,
      correct: c.correct,
      explanation: c.explanation ?? null,
    })),
    masteryAfter,
    statusAfter,
    nextReviewAt: nextReview,
    attemptId,
  };
}
