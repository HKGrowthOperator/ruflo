/**
 * Auswertungen: Bereichs-Lernstände, Prüfungsreife (§21), Risiken und Hebel
 * für Startseite und Dashboard.
 */
import { getDb } from '../db';
import { computeReadiness, type ReadinessResult } from '../domain/readiness';
import { MAIN_AREAS, MAIN_AREA_LABELS, type ErrorCode, type MainArea } from '../domain/types';

export interface AreaStats {
  area: MainArea;
  label: string;
  total: number;
  tested: number;
  avgMastery: number;
  avgStability: number;
  weakCount: number;
}

export function areaStats(userId: number): AreaStats[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT c.main_area AS area,
              COUNT(*) AS total,
              SUM(CASE WHEN lc.attempt_count > 0 THEN 1 ELSE 0 END) AS tested,
              AVG(COALESCE(lc.mastery, 0)) AS avg_mastery,
              AVG(COALESCE(lc.stability_score, 0)) AS avg_stability,
              SUM(CASE WHEN COALESCE(lc.mastery, 0) < 0.4 AND lc.attempt_count > 0 THEN 1 ELSE 0 END) AS weak
       FROM competencies c
       LEFT JOIN learner_competencies lc ON lc.competency_id = c.id AND lc.user_id = ?
       WHERE c.status = 'freigegeben'
       GROUP BY c.main_area`,
    )
    .all(userId) as { area: MainArea; total: number; tested: number; avg_mastery: number; avg_stability: number; weak: number }[];

  return MAIN_AREAS.map((area) => {
    const r = rows.find((x) => x.area === area);
    return {
      area,
      label: MAIN_AREA_LABELS[area],
      total: r?.total ?? 0,
      tested: r?.tested ?? 0,
      avgMastery: r?.avg_mastery ?? 0,
      avgStability: r?.avg_stability ?? 0,
      weakCount: r?.weak ?? 0,
    };
  });
}

export function readinessFor(userId: number): ReadinessResult {
  const db = getDb();
  const stats = areaStats(userId);
  const diagnosed = Boolean(
    (db.prepare('SELECT diagnosed_at FROM learner_profiles WHERE user_id = ?').get(userId) as { diagnosed_at: string | null } | undefined)
      ?.diagnosed_at,
  );

  const weakCore = (
    db
      .prepare(
        `SELECT COUNT(*) n FROM competencies c
         LEFT JOIN learner_competencies lc ON lc.competency_id = c.id AND lc.user_id = ?
         WHERE c.criticality = 1 AND c.status = 'freigegeben' AND COALESCE(lc.mastery, 0) < 0.4`,
      )
      .get(userId) as { n: number }
  ).n;

  const sims = db
    .prepare(`SELECT score_json FROM simulations WHERE user_id = ? AND submitted_at IS NOT NULL ORDER BY submitted_at DESC`)
    .all(userId) as { score_json: string | null }[];
  let passed = 0;
  for (const s of sims) {
    if (!s.score_json) continue;
    const score = JSON.parse(s.score_json) as { percent?: number };
    if ((score.percent ?? 0) >= 50) passed++;
  }

  const areaMastery = (area: MainArea) => stats.find((s) => s.area === area)?.avgMastery ?? 0;

  // Rechnen-Mastery: über number_unit-Versuche angenähert
  const rechnen = db
    .prepare(
      `SELECT AVG(CASE WHEN a.points_max > 0 THEN a.points_awarded / a.points_max ELSE 0 END) AS q
       FROM attempts a JOIN questions qq ON qq.id = a.question_id
       WHERE a.user_id = ? AND qq.qtype = 'number_unit'`,
    )
    .get(userId) as { q: number | null };

  return computeReadiness({
    areas: stats.map((s) => ({ area: s.area, avgMastery: s.avgMastery, coverage: s.total > 0 ? s.tested / s.total : 0, avgStability: s.avgStability })),
    weakCoreCompetencies: weakCore,
    diagnosed,
    passedSimulations: passed,
    lastSimulationWithoutHelp: sims.length > 0, // Simulationen sind immer ohne Hilfen (§20)
    planlesenMastery: areaMastery('planung'),
    rechnenMastery: rechnen.q ?? 0,
    konstruktionenMastery: areaMastery('trockenbaukonstruktionen'),
    bauphysikMastery: areaMastery('bauphysik'),
  });
}

export interface RiskAndLever {
  biggestRisk: { competencyId: string; title: string; area: string } | null;
  fastestLever: { competencyId: string; title: string; area: string } | null;
  dueReviews: number;
  openCriticalErrors: number;
}

export function riskAndLever(userId: number): RiskAndLever {
  const db = getDb();
  const risk = db
    .prepare(
      `SELECT c.id, c.title, c.main_area FROM competencies c
       LEFT JOIN learner_competencies lc ON lc.competency_id = c.id AND lc.user_id = ?
       WHERE c.status = 'freigegeben'
       ORDER BY (c.exam_relevance * (1 - COALESCE(lc.mastery, 0)) * c.points_potential) DESC
       LIMIT 1`,
    )
    .get(userId) as { id: string; title: string; main_area: string } | undefined;

  const lever = db
    .prepare(
      `SELECT c.id, c.title, c.main_area FROM competencies c
       LEFT JOIN learner_competencies lc ON lc.competency_id = c.id AND lc.user_id = ?
       WHERE c.status = 'freigegeben' AND COALESCE(lc.mastery, 0) < 0.7
       ORDER BY (c.exam_relevance * c.points_potential / c.learning_effort) DESC
       LIMIT 1`,
    )
    .get(userId) as { id: string; title: string; main_area: string } | undefined;

  const due = (
    db
      .prepare(
        `SELECT COUNT(*) n FROM learner_competencies
         WHERE user_id = ? AND next_review_at IS NOT NULL AND next_review_at <= datetime('now')`,
      )
      .get(userId) as { n: number }
  ).n;

  const critical = (
    db
      .prepare(`SELECT COUNT(*) n FROM error_events WHERE user_id = ? AND resolved_at IS NULL AND severity >= 3`)
      .get(userId) as { n: number }
  ).n;

  return {
    biggestRisk: risk ? { competencyId: risk.id, title: risk.title, area: risk.main_area } : null,
    fastestLever: lever ? { competencyId: lever.id, title: lever.title, area: lever.main_area } : null,
    dueReviews: due,
    openCriticalErrors: critical,
  };
}

export interface ErrorProfileEntry {
  code: ErrorCode;
  count: number;
  unresolved: number;
}

export function errorProfile(userId: number): ErrorProfileEntry[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT error_code AS code, COUNT(*) AS count,
              SUM(CASE WHEN resolved_at IS NULL THEN 1 ELSE 0 END) AS unresolved
       FROM error_events WHERE user_id = ? GROUP BY error_code ORDER BY count DESC`,
    )
    .all(userId) as ErrorProfileEntry[];
  return rows;
}
