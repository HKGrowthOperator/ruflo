/**
 * Eingangsdiagnose-Service (§17): stellt den Schnelltest zusammen und
 * markiert das Profil nach Abschluss als diagnostiziert.
 */
import { getDb } from '../db';
import { assembleDiagnosis, type DiagnosisCandidate } from '../domain/diagnosis';
import type { MainArea, QuestionType } from '../domain/types';

export function buildDiagnosisSet(userId: number): string[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT q.id, c.main_area, q.qtype, q.exam_relevance, q.difficulty, q.time_seconds,
              qc.competency_id AS primary_competency
       FROM questions q
       JOIN question_competencies qc ON qc.question_id = q.id AND qc.is_primary = 1
       JOIN competencies c ON c.id = qc.competency_id
       WHERE q.status = 'freigegeben'
         AND q.qtype IN ('single_choice','multiple_choice','matching','number_unit','short_text')
         AND q.id NOT IN (SELECT question_id FROM attempts WHERE user_id = ?)`,
    )
    .all(userId) as {
    id: string; main_area: MainArea; qtype: QuestionType; exam_relevance: number;
    difficulty: number; time_seconds: number; primary_competency: string;
  }[];

  const candidates: DiagnosisCandidate[] = rows.map((r) => ({
    id: r.id,
    mainArea: r.main_area,
    qtype: r.qtype,
    examRelevance: r.exam_relevance,
    difficulty: r.difficulty,
    timeSeconds: r.time_seconds,
    primaryCompetencyId: r.primary_competency,
  }));

  return assembleDiagnosis(candidates, 28).map((c) => c.id);
}

export function markDiagnosed(userId: number): void {
  getDb().prepare(`UPDATE learner_profiles SET diagnosed_at = datetime('now') WHERE user_id = ?`).run(userId);
}

export function isDiagnosed(userId: number): boolean {
  const row = getDb().prepare('SELECT diagnosed_at FROM learner_profiles WHERE user_id = ?').get(userId) as
    | { diagnosed_at: string | null }
    | undefined;
  return Boolean(row?.diagnosed_at);
}
