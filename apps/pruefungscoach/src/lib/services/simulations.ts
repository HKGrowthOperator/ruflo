/**
 * Simulations-Service (§20/§21): Zusammenstellung, Autosave, Abgabe mit
 * vollständiger Bewertung und Ursachen-Auswertung + Reparaturplan.
 */
import { getDb } from '../db';
import { assembleSimulation, blueprintFor, categoryOf, type SimCandidate, type SimKind } from '../domain/simulation';
import type { AnswerPayload } from '../domain/scoring';
import type { ErrorCode, MainArea, QuestionType } from '../domain/types';
import { gradeAnswer } from './attempts';
import { loadQuestion } from './questions';

export function createSimulation(userId: number, kind: SimKind): number {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT q.id, q.qtype, q.exam_part, q.exam_relevance, q.difficulty, q.points,
              qc.competency_id AS comp, c.main_area,
              (SELECT COUNT(*) FROM attempts a WHERE a.user_id = @userId AND a.question_id = q.id) AS seen
       FROM questions q
       JOIN question_competencies qc ON qc.question_id = q.id AND qc.is_primary = 1
       JOIN competencies c ON c.id = qc.competency_id
       WHERE q.status = 'freigegeben'`,
    )
    .all({ userId }) as {
    id: string; qtype: QuestionType; exam_part: 'tk' | 'san'; exam_relevance: number;
    difficulty: number; points: number; comp: string; main_area: MainArea; seen: number;
  }[];

  const candidates: SimCandidate[] = rows.map((r) => ({
    id: r.id,
    qtype: r.qtype,
    examPart: r.exam_part,
    examRelevance: r.exam_relevance,
    difficulty: r.difficulty,
    points: r.points,
    primaryCompetencyId: r.comp,
    mainArea: r.main_area,
    timesSeen: r.seen,
  }));

  const chosen = assembleSimulation(candidates, kind);
  const bp = blueprintFor(kind);

  const res = db
    .prepare('INSERT INTO simulations (user_id, kind, exam_part, time_limit_s) VALUES (?, ?, ?, ?)')
    .run(userId, kind, 'tk', bp.timeLimitS);
  const simId = Number(res.lastInsertRowid);
  const ins = db.prepare('INSERT INTO simulation_items (sim_id, question_id, position, points_max) VALUES (?, ?, ?, ?)');
  chosen.forEach((q, i) => ins.run(simId, q.id, i, q.points));
  return simId;
}

export function saveSimAnswer(simId: number, questionId: string, answer: AnswerPayload, flagged: boolean): void {
  const db = getDb();
  db.prepare('UPDATE simulation_items SET answer_json = ?, flagged = ? WHERE sim_id = ? AND question_id = ?').run(
    JSON.stringify(answer),
    flagged ? 1 : 0,
    simId,
    questionId,
  );
}

export interface SimEvaluation {
  totalPoints: number;
  maxPoints: number;
  percent: number;
  byArea: { area: string; points: number; max: number }[];
  byCategory: { category: string; points: number; max: number }[];
  byErrorCode: { code: ErrorCode; lostPoints: number }[];
  repairPlan: { competencyId: string; title: string; lostPoints: number }[];
  timeUsedS: number;
}

/** Abgabe: bewertet alle Items, aktualisiert Lernstände über attempts. */
export async function submitSimulation(userId: number, simId: number): Promise<SimEvaluation> {
  const db = getDb();
  const sim = db.prepare('SELECT * FROM simulations WHERE id = ? AND user_id = ?').get(simId, userId) as
    | { id: number; started_at: string; time_limit_s: number; submitted_at: string | null }
    | undefined;
  if (!sim) throw new Error('Simulation nicht gefunden');
  if (sim.submitted_at) {
    return JSON.parse(
      (db.prepare('SELECT score_json FROM simulations WHERE id = ?').get(simId) as { score_json: string }).score_json,
    ) as SimEvaluation;
  }

  const items = db
    .prepare('SELECT id, question_id, answer_json, points_max FROM simulation_items WHERE sim_id = ? ORDER BY position')
    .all(simId) as { id: number; question_id: string; answer_json: string | null; points_max: number }[];

  let total = 0;
  let max = 0;
  const byArea = new Map<string, { points: number; max: number }>();
  const byCategory = new Map<string, { points: number; max: number }>();
  const lostByCode = new Map<ErrorCode, number>();
  const lostByCompetency = new Map<string, { title: string; lost: number }>();

  const { submitAttempt } = await import('./attempts');

  for (const item of items) {
    const question = loadQuestion(item.question_id);
    if (!question) continue;
    max += question.points;

    const area = (db
      .prepare(
        `SELECT c.main_area, c.title, c.id FROM competencies c
         JOIN question_competencies qc ON qc.competency_id = c.id AND qc.question_id = ? AND qc.is_primary = 1`,
      )
      .get(item.question_id) as { main_area: string; title: string; id: string } | undefined) ?? {
      main_area: 'unbekannt',
      title: item.question_id,
      id: '',
    };

    const answer: AnswerPayload = item.answer_json
      ? (JSON.parse(item.answer_json) as AnswerPayload)
      : { kind: 'text', text: '' };

    // Bewertung + Lernstands-Update über den regulären Attempt-Pfad (ohne Hilfen, §20)
    const feedback = await submitAttempt({
      userId,
      questionId: item.question_id,
      context: 'simulation',
      answer,
      helpLevel: 0,
      confidence: null,
      timeTakenSeconds: 0,
      simId,
    });
    const outcome = feedback.outcome;

    db.prepare('UPDATE simulation_items SET points_awarded = ?, error_codes = ? WHERE id = ?').run(
      outcome.pointsAwarded,
      JSON.stringify(outcome.errorCodes),
      item.id,
    );

    total += outcome.pointsAwarded;
    const lost = question.points - outcome.pointsAwarded;

    const areaAgg = byArea.get(area.main_area) ?? { points: 0, max: 0 };
    areaAgg.points += outcome.pointsAwarded;
    areaAgg.max += question.points;
    byArea.set(area.main_area, areaAgg);

    const cat = categoryOf(question.qtype);
    const catAgg = byCategory.get(cat) ?? { points: 0, max: 0 };
    catAgg.points += outcome.pointsAwarded;
    catAgg.max += question.points;
    byCategory.set(cat, catAgg);

    if (lost > 0.01) {
      for (const code of outcome.errorCodes) {
        lostByCode.set(code, (lostByCode.get(code) ?? 0) + lost / Math.max(1, outcome.errorCodes.length));
      }
      if (area.id) {
        const agg = lostByCompetency.get(area.id) ?? { title: area.title, lost: 0 };
        agg.lost += lost;
        lostByCompetency.set(area.id, agg);
      }
    }
  }

  const startedAt = new Date(`${sim.started_at.replace(' ', 'T')}Z`).getTime();
  const timeUsedS = Math.min(sim.time_limit_s, Math.max(0, Math.round((Date.now() - startedAt) / 1000)));

  const evaluation: SimEvaluation = {
    totalPoints: Math.round(total * 100) / 100,
    maxPoints: max,
    percent: max > 0 ? Math.round((total / max) * 100) : 0,
    byArea: [...byArea.entries()].map(([areaKey, v]) => ({ area: areaKey, points: Math.round(v.points * 10) / 10, max: v.max })),
    byCategory: [...byCategory.entries()].map(([category, v]) => ({ category, points: Math.round(v.points * 10) / 10, max: v.max })),
    byErrorCode: [...lostByCode.entries()]
      .map(([code, lostPoints]) => ({ code, lostPoints: Math.round(lostPoints * 10) / 10 }))
      .sort((a, b) => b.lostPoints - a.lostPoints),
    repairPlan: [...lostByCompetency.entries()]
      .map(([competencyId, v]) => ({ competencyId, title: v.title, lostPoints: Math.round(v.lost * 10) / 10 }))
      .sort((a, b) => b.lostPoints - a.lostPoints)
      .slice(0, 6),
    timeUsedS,
  };

  db.prepare(`UPDATE simulations SET submitted_at = datetime('now'), score_json = ? WHERE id = ?`).run(
    JSON.stringify(evaluation),
    simId,
  );
  return evaluation;
}
