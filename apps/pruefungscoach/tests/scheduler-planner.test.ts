import { describe, expect, it } from 'vitest';
import { intervalLadder, nextReviewAt, stageAfterFailure, stageAfterSuccess } from '@/lib/domain/scheduler';
import { buildDailyPlan, dailyMix, desiredDifficulty, type PlannerCompetency } from '@/lib/domain/planner';
import { planModeForDaysLeft } from '@/lib/domain/modes';
import { priorityScore } from '@/lib/domain/priority';

describe('planModeForDaysLeft (§16)', () => {
  it('ordnet Restzeit den Modi zu', () => {
    expect(planModeForDaysLeft(100)).toBe('vollstaendig');
    expect(planModeForDaysLeft(60)).toBe('regulaer');
    expect(planModeForDaysLeft(30)).toBe('fokussiert');
    expect(planModeForDaysLeft(15)).toBe('intensiv');
    expect(planModeForDaysLeft(10)).toBe('bestehensmodus');
    expect(planModeForDaysLeft(4)).toBe('notfall');
    expect(planModeForDaysLeft(2)).toBe('punkterettung');
  });
});

describe('intervalLadder (§15)', () => {
  it('lange Vorbereitung: 0/1/3/7/14/30 Tage', () => {
    expect(intervalLadder(90)).toEqual([0, 1, 3, 7, 14, 30]);
  });
  it('7-Tage-Fenster enthält Vortag als letzte Stufe', () => {
    const ladder = intervalLadder(7);
    expect(ladder[ladder.length - 1]).toBe(6);
  });
  it('nextReviewAt terminiert nie nach der Prüfung', () => {
    const now = new Date('2026-07-13T10:00:00Z');
    const iso = nextReviewAt({ daysToExam: 2, stage: 5, now });
    const t = new Date(iso).getTime();
    expect(t).toBeLessThanOrEqual(now.getTime() + 1.5 * 86_400_000);
  });
});

describe('stage transitions', () => {
  it('kritischer Fehler wirft auf Stufe 0 zurück', () => {
    expect(stageAfterFailure(4, ['F16'])).toBe(0);
    expect(stageAfterFailure(4, ['F2'])).toBe(0);
  });
  it('leichter Fehler nur eine Stufe zurück', () => {
    expect(stageAfterFailure(4, ['F9'])).toBe(3);
  });
  it('Erfolg mit starker Hilfe steigt nicht auf (§3.4)', () => {
    expect(stageAfterSuccess(2, 4)).toBe(2);
    expect(stageAfterSuccess(2, 0)).toBe(3);
  });
});

function comp(id: string, overrides: Partial<PlannerCompetency> = {}): PlannerCompetency {
  return {
    id,
    mainArea: 'bauphysik',
    mastery: 0.3,
    status: 'begonnen',
    examRelevance: 4,
    dependencyValue: 2,
    pointsPotential: 3,
    learningEffort: 2,
    nextReviewAt: null,
    untested: false,
    criticalMisconception: false,
    prerequisiteReadiness: 1,
    ...overrides,
  };
}

describe('buildDailyPlan (§18)', () => {
  const now = new Date('2026-07-13T08:00:00Z');
  it('fällige Wiederholungen kommen zuerst', () => {
    const comps = [
      comp('BPH-001', { nextReviewAt: '2026-07-12T08:00:00Z' }),
      comp('BPH-002'),
      comp('TKW-001', { mainArea: 'trockenbaukonstruktionen' }),
    ];
    const plan = buildDailyPlan(comps, { mode: 'regulaer', minutes: 30, now });
    expect(plan[0]?.kind).toBe('review');
    expect(plan[0]?.competencyId).toBe('BPH-001');
  });
  it('Planlänge folgt der Lernzeit', () => {
    const comps = Array.from({ length: 50 }, (_, i) => comp(`BPH-${100 + i}`));
    const short = buildDailyPlan(comps, { mode: 'regulaer', minutes: 20, now });
    const long = buildDailyPlan(comps, { mode: 'regulaer', minutes: 90, now });
    expect(long.length).toBeGreaterThan(short.length);
  });
  it('kritische Fehlkonzepte werden priorisiert', () => {
    const comps = [
      comp('BPH-001', { mastery: 0.5 }),
      comp('BPH-002', { mastery: 0.5, criticalMisconception: true }),
    ];
    const plan = buildDailyPlan(comps, { mode: 'regulaer', minutes: 10, now });
    expect(plan.map((p) => p.competencyId)).toContain('BPH-002');
    const first = plan.find((p) => p.kind !== 'review');
    expect(first).toBeDefined();
  });
  it('Mix-Summe ist 1 für alle Modi', () => {
    for (const mode of ['vollstaendig', 'regulaer', 'fokussiert', 'intensiv', 'bestehensmodus', 'notfall', 'punkterettung'] as const) {
      const mix = dailyMix(mode);
      const sum = Object.values(mix).reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1, 5);
    }
  });
});

describe('priorityScore (§14)', () => {
  const base = {
    examRelevance: 4,
    mastery: 0.3,
    dependencyValue: 2,
    pointsPotential: 3,
    learningEffort: 2,
    mode: 'regulaer' as const,
    overdueHours: 0,
    untested: false,
    criticalMisconception: false,
    prerequisiteReadiness: 1,
    areaRepetitionsToday: 0,
  };
  it('höheres Defizit → höhere Priorität', () => {
    expect(priorityScore({ ...base, mastery: 0.1 })).toBeGreaterThan(priorityScore({ ...base, mastery: 0.8 }));
  });
  it('Fälligkeit erhöht Priorität', () => {
    expect(priorityScore({ ...base, overdueHours: 48 })).toBeGreaterThan(priorityScore(base));
  });
  it('bei Punkterettung werden aufwendige Themen gedämpft', () => {
    const cheap = priorityScore({ ...base, mode: 'punkterettung', learningEffort: 1 });
    const expensive = priorityScore({ ...base, mode: 'punkterettung', learningEffort: 5 });
    expect(cheap / expensive).toBeGreaterThan(5);
  });
  it('fehlende Voraussetzungen dämpfen', () => {
    expect(priorityScore({ ...base, prerequisiteReadiness: 0 })).toBeLessThan(priorityScore(base));
  });
});

describe('desiredDifficulty (§5)', () => {
  it('niedrige Mastery → leichte Aufgaben', () => {
    expect(desiredDifficulty(0).max).toBeLessThanOrEqual(2);
    expect(desiredDifficulty(0.9).max).toBe(5);
  });
});
