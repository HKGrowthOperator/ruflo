/**
 * Tagesplan-Service: erzeugt/liest den Plan des Tages (§18) und wählt je
 * Plan-Item die passende Frage (§5 Desirable Difficulty, §11 Fragenfamilien).
 */
import { getDb } from '../db';
import { buildDailyPlan, desiredDifficulty, type PlannerCompetency } from '../domain/planner';
import { daysUntil, planModeForDaysLeft } from '../domain/modes';
import type { PlanMode, QuestionFamily } from '../domain/types';

export interface PlanItemView {
  id: number;
  kind: string;
  competencyId: string;
  competencyTitle: string;
  mainArea: string;
  status: string;
  position: number;
}

export interface TodayPlan {
  planId: number;
  mode: PlanMode;
  minutesTarget: number;
  items: PlanItemView[];
  doneCount: number;
  focusArea: string | null;
}

function loadPlannerCompetencies(userId: number): PlannerCompetency[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT c.id, c.main_area, c.exam_relevance, c.dependency_value, c.points_potential,
              c.learning_effort, c.prerequisites,
              lc.mastery, lc.status, lc.next_review_at, lc.attempt_count,
              (SELECT COUNT(*) FROM error_events e
                WHERE e.user_id = @userId AND e.competency_id = c.id
                  AND e.resolved_at IS NULL AND e.severity >= 3) AS critical_errors
       FROM competencies c
       LEFT JOIN learner_competencies lc ON lc.competency_id = c.id AND lc.user_id = @userId
       WHERE c.status = 'freigegeben'`,
    )
    .all({ userId }) as {
    id: string;
    main_area: string;
    exam_relevance: number;
    dependency_value: number;
    points_potential: number;
    learning_effort: number;
    prerequisites: string;
    mastery: number | null;
    status: string | null;
    next_review_at: string | null;
    attempt_count: number | null;
    critical_errors: number;
  }[];

  const masteryById = new Map(rows.map((r) => [r.id, r.mastery ?? 0]));
  return rows.map((r) => {
    const prereqs = JSON.parse(r.prerequisites) as string[];
    const readiness =
      prereqs.length === 0
        ? 1
        : prereqs.reduce((s, p) => s + Math.min(1, (masteryById.get(p) ?? 0) / 0.5), 0) / prereqs.length;
    return {
      id: r.id,
      mainArea: r.main_area,
      mastery: r.mastery ?? 0,
      status: r.status ?? 'unbekannt',
      examRelevance: r.exam_relevance,
      dependencyValue: r.dependency_value,
      pointsPotential: r.points_potential,
      learningEffort: r.learning_effort,
      nextReviewAt: r.next_review_at,
      untested: (r.attempt_count ?? 0) === 0,
      criticalMisconception: r.critical_errors > 0,
      prerequisiteReadiness: readiness,
    };
  });
}

export function getOrCreateTodayPlan(userId: number): TodayPlan | null {
  const db = getDb();
  const profile = db
    .prepare('SELECT exam_date, minutes_weekday, minutes_weekend FROM learner_profiles WHERE user_id = ?')
    .get(userId) as { exam_date: string; minutes_weekday: number; minutes_weekend: number } | undefined;
  if (!profile) return null;

  const today = new Date().toISOString().slice(0, 10);
  let plan = db.prepare('SELECT * FROM study_plans WHERE user_id = ? AND plan_date = ?').get(userId, today) as
    | { id: number; mode: PlanMode; minutes_target: number; focus_area: string | null }
    | undefined;

  if (!plan) {
    const daysLeft = daysUntil(profile.exam_date);
    const mode = planModeForDaysLeft(daysLeft);
    const dow = new Date().getDay();
    const minutes = dow === 0 || dow === 6 ? profile.minutes_weekend : profile.minutes_weekday;
    const comps = loadPlannerCompetencies(userId);
    const items = buildDailyPlan(comps, { mode, minutes, now: new Date() });

    const areaCount: Record<string, number> = {};
    for (const it of items) {
      const area = comps.find((c) => c.id === it.competencyId)?.mainArea;
      if (area) areaCount[area] = (areaCount[area] ?? 0) + 1;
    }
    const focusArea = Object.entries(areaCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    const ins = db.prepare(
      'INSERT INTO study_plans (user_id, plan_date, mode, minutes_target, focus_area, summary_json) VALUES (?, ?, ?, ?, ?, ?)',
    );
    const res = ins.run(userId, today, mode, minutes, focusArea, JSON.stringify({ daysLeft, itemCount: items.length }));
    const planId = Number(res.lastInsertRowid);
    const insItem = db.prepare(
      'INSERT INTO study_plan_items (plan_id, kind, competency_id, position) VALUES (?, ?, ?, ?)',
    );
    items.forEach((it, i) => insItem.run(planId, it.kind, it.competencyId, i));
    plan = { id: planId, mode, minutes_target: minutes, focus_area: focusArea };
  }

  const items = db
    .prepare(
      `SELECT i.id, i.kind, i.competency_id, i.position, i.status,
              c.title AS competency_title, c.main_area
       FROM study_plan_items i JOIN competencies c ON c.id = i.competency_id
       WHERE i.plan_id = ? ORDER BY i.position`,
    )
    .all(plan.id) as {
    id: number; kind: string; competency_id: string; position: number; status: string;
    competency_title: string; main_area: string;
  }[];

  return {
    planId: plan.id,
    mode: plan.mode,
    minutesTarget: plan.minutes_target,
    focusArea: plan.focus_area,
    doneCount: items.filter((i) => i.status === 'done').length,
    items: items.map((i) => ({
      id: i.id,
      kind: i.kind,
      competencyId: i.competency_id,
      competencyTitle: i.competency_title,
      mainArea: i.main_area,
      status: i.status,
      position: i.position,
    })),
  };
}

/** Fragenfamilie passend zum Lernstand wählen (Worked-example-Fading §5). */
function familyLadder(mastery: number, kind: string): QuestionFamily[] {
  if (kind === 'transfer') return ['transfer', 'application', 'error_finding'];
  if (kind === 'secure') return ['speed', 'application', 'recall'];
  if (mastery < 0.25) return ['recognition', 'recall', 'function'];
  if (mastery < 0.5) return ['recall', 'function', 'application'];
  if (mastery < 0.75) return ['application', 'error_finding', 'transfer'];
  return ['transfer', 'speed', 'application'];
}

export interface NextQuestionPick {
  questionId: string;
  planItemId: number;
}

/** Wählt für das nächste offene Plan-Item die konkrete Frage. */
export function pickQuestionForItem(userId: number, planItemId: number): NextQuestionPick | null {
  const db = getDb();
  const item = db
    .prepare(
      `SELECT i.id, i.kind, i.competency_id, COALESCE(lc.mastery, 0) AS mastery
       FROM study_plan_items i
       LEFT JOIN learner_competencies lc ON lc.competency_id = i.competency_id AND lc.user_id = ?
       WHERE i.id = ?`,
    )
    .get(userId, planItemId) as { id: number; kind: string; competency_id: string; mastery: number } | undefined;
  if (!item) return null;

  const { min, max } = desiredDifficulty(item.mastery);
  const families = familyLadder(item.mastery, item.kind);

  const candidates = db
    .prepare(
      `SELECT q.id, q.family, q.difficulty,
              (SELECT COUNT(*) FROM attempts a WHERE a.user_id = @userId AND a.question_id = q.id) AS seen,
              (SELECT MAX(a.created_at) FROM attempts a WHERE a.user_id = @userId AND a.question_id = q.id) AS last_seen
       FROM questions q
       JOIN question_competencies qc ON qc.question_id = q.id AND qc.competency_id = @compId
       WHERE q.status = 'freigegeben'`,
    )
    .all({ userId, compId: item.competency_id }) as {
    id: string; family: QuestionFamily; difficulty: number; seen: number; last_seen: string | null;
  }[];
  if (candidates.length === 0) return null;

  let best: (typeof candidates)[number] | null = null;
  let bestScore = -Infinity;
  for (const c of candidates) {
    let score = 0;
    const famIdx = families.indexOf(c.family);
    score += famIdx >= 0 ? (3 - famIdx) * 4 : 0;
    if (c.difficulty >= min && c.difficulty <= max) score += 5;
    else score -= Math.min(Math.abs(c.difficulty - min), Math.abs(c.difficulty - max)) * 2;
    score -= c.seen * 3; // Variation statt identischer Wiederholung (§11)
    if (c.last_seen) {
      const hours = (Date.now() - new Date(c.last_seen).getTime()) / 3_600_000;
      if (hours < 24) score -= 6;
    }
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }
  return best ? { questionId: best.id, planItemId: item.id } : null;
}
