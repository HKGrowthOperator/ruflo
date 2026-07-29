import { describe, expect, it } from 'vitest';
import { computeReadiness, type ReadinessInput } from '@/lib/domain/readiness';
import { assembleSimulation, blueprintFor, categoryOf, type SimCandidate } from '@/lib/domain/simulation';
import { MAIN_AREAS } from '@/lib/domain/types';

function readinessInput(overrides: Partial<ReadinessInput> = {}): ReadinessInput {
  return {
    areas: MAIN_AREAS.map((area) => ({ area, avgMastery: 0.7, coverage: 0.9, avgStability: 0.7 })),
    weakCoreCompetencies: 0,
    diagnosed: true,
    passedSimulations: 2,
    lastSimulationWithoutHelp: true,
    planlesenMastery: 0.7,
    rechnenMastery: 0.7,
    konstruktionenMastery: 0.7,
    bauphysikMastery: 0.7,
    ...overrides,
  };
}

describe('computeReadiness (§21)', () => {
  it('nicht diagnostiziert ohne Diagnose', () => {
    expect(computeReadiness(readinessInput({ diagnosed: false })).status).toBe('nicht_diagnostiziert');
  });
  it('alle Schwellen erfüllt → prüfungsreif', () => {
    const r = computeReadiness(readinessInput());
    expect(['pruefungsreif', 'stabil_pruefungsreif']).toContain(r.status);
    expect(r.expectedScore).toBe(70);
  });
  it('schwaches Rechnen verhindert Prüfungsreife', () => {
    const r = computeReadiness(readinessInput({ rechnenMastery: 0.5 }));
    expect(r.status).toBe('wahrscheinlich_bestehensfaehig');
  });
  it('geringe Abdeckung → breiter Prognosebereich', () => {
    const narrow = computeReadiness(readinessInput());
    const wide = computeReadiness(readinessInput({ areas: MAIN_AREAS.map((area) => ({ area, avgMastery: 0.7, coverage: 0.2, avgStability: 0.7 })) }));
    expect(wide.scoreRange[1] - wide.scoreRange[0]).toBeGreaterThan(narrow.scoreRange[1] - narrow.scoreRange[0]);
  });
});

function candidate(id: string, overrides: Partial<SimCandidate> = {}): SimCandidate {
  return {
    id,
    qtype: 'single_choice',
    examPart: 'tk',
    examRelevance: 3,
    difficulty: 3,
    points: 2,
    primaryCompetencyId: `C-${id}`,
    mainArea: 'bauphysik',
    timesSeen: 0,
    ...overrides,
  };
}

describe('assembleSimulation (§20)', () => {
  const pool: SimCandidate[] = [
    ...Array.from({ length: 20 }, (_, i) => candidate(`mc-${i}`)),
    ...Array.from({ length: 10 }, (_, i) => candidate(`st-${i}`, { qtype: 'short_text' })),
    ...Array.from({ length: 6 }, (_, i) => candidate(`pl-${i}`, { qtype: 'plan_question' })),
    ...Array.from({ length: 6 }, (_, i) => candidate(`nu-${i}`, { qtype: 'number_unit' })),
    ...Array.from({ length: 4 }, (_, i) => candidate(`sy-${i}`, { qtype: 'system_selection', examPart: 'san' })),
    ...Array.from({ length: 4 }, (_, i) => candidate(`pr-${i}`, { qtype: 'project', examPart: 'san', points: 10 })),
  ];

  it('Mini-Simulation hält die Kategorienverteilung grob ein', () => {
    const sim = assembleSimulation(pool, 'mini');
    expect(sim.length).toBe(blueprintFor('mini').totalQuestions);
    const cats = sim.map((q) => categoryOf(q.qtype));
    expect(cats.filter((c) => c === 'gebunden').length).toBeGreaterThanOrEqual(2);
    expect(cats).toContain('rechnen');
    expect(cats).toContain('kurzantwort');
  });

  it('ist deterministisch bei gleichem Input', () => {
    const a = assembleSimulation(pool, 'mini').map((q) => q.id);
    const b = assembleSimulation(pool, 'mini').map((q) => q.id);
    expect(a).toEqual(b);
  });

  it('bevorzugt ungesehene Fragen', () => {
    const seenPool = pool.map((c) => (c.id === 'mc-0' ? { ...c, timesSeen: 5 } : c));
    const sim = assembleSimulation(seenPool, 'mini');
    expect(sim.map((q) => q.id)).not.toContain('mc-0');
  });

  it('deckt verschiedene Kompetenzen ab', () => {
    const sim = assembleSimulation(pool, 'teil');
    const comps = new Set(sim.map((q) => q.primaryCompetencyId));
    expect(comps.size).toBe(sim.length);
  });
});
