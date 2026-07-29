/**
 * Prüfungsreife & Punkteprognose (Masterbrief §21) — deterministisch.
 */
import { MAIN_AREA_WEIGHTS, type MainArea, type ReadinessStatus } from './types';

export interface AreaState {
  area: MainArea;
  avgMastery: number; // 0–1 über Kompetenzen des Bereichs
  coverage: number; // Anteil getesteter Kompetenzen 0–1
  avgStability: number;
}

export interface ReadinessInput {
  areas: AreaState[];
  /** Kernkompetenzen (criticality=1) mit Mastery < 0.4 */
  weakCoreCompetencies: number;
  diagnosed: boolean;
  passedSimulations: number;
  lastSimulationWithoutHelp: boolean;
  planlesenMastery: number;
  rechnenMastery: number;
  konstruktionenMastery: number;
  bauphysikMastery: number;
}

export interface ReadinessResult {
  status: ReadinessStatus;
  /** erwarteter Punktebereich in Prozent [low, high] */
  scoreRange: [number, number];
  expectedScore: number;
  coverage: number;
  /** Prognosesicherheit 0–1 (steigt mit Abdeckung und Stabilität) */
  prognosisConfidence: number;
}

export function computeReadiness(input: ReadinessInput): ReadinessResult {
  let weighted = 0;
  let coverageWeighted = 0;
  let stabilityWeighted = 0;
  let totalWeight = 0;
  for (const a of input.areas) {
    const w = MAIN_AREA_WEIGHTS[a.area];
    totalWeight += w;
    weighted += w * a.avgMastery;
    coverageWeighted += w * a.coverage;
    stabilityWeighted += w * a.avgStability;
  }
  const mastery = totalWeight > 0 ? weighted / totalWeight : 0;
  const coverage = totalWeight > 0 ? coverageWeighted / totalWeight : 0;
  const stability = totalWeight > 0 ? stabilityWeighted / totalWeight : 0;

  // Punkteprognose: Mastery in Prozentpunkte, ungetestete Bereiche drücken
  // die Untergrenze (Unsicherheit), Stabilität verengt das Band.
  const expected = Math.round(mastery * 100);
  const uncertainty = Math.round(25 * (1 - coverage) + 12 * (1 - stability));
  const low = Math.max(0, expected - uncertainty);
  const high = Math.min(100, expected + Math.round(uncertainty * 0.6));
  const prognosisConfidence = Math.round((0.6 * coverage + 0.4 * stability) * 100) / 100;

  let status: ReadinessStatus;
  if (!input.diagnosed) status = 'nicht_diagnostiziert';
  else if (expected < 35 || input.weakCoreCompetencies > 5) status = 'hohes_risiko';
  else if (expected < 50) status = 'grundlagen';
  else if (
    expected >= 60 &&
    input.weakCoreCompetencies === 0 &&
    input.planlesenMastery >= 0.55 &&
    input.rechnenMastery >= 0.65 &&
    input.konstruktionenMastery >= 0.55 &&
    input.bauphysikMastery >= 0.55 &&
    coverage >= 0.8 &&
    input.passedSimulations >= 2 &&
    input.lastSimulationWithoutHelp
  ) {
    status = stability >= 0.6 ? 'stabil_pruefungsreif' : 'pruefungsreif';
  } else if (expected >= 60 && input.weakCoreCompetencies === 0) status = 'wahrscheinlich_bestehensfaehig';
  else status = 'bedingt_bestehensfaehig';

  return { status, scoreRange: [low, high], expectedScore: expected, coverage, prognosisConfidence };
}

export const READINESS_LABELS: Record<ReadinessStatus, string> = {
  nicht_diagnostiziert: 'Noch nicht diagnostiziert',
  hohes_risiko: 'Hohes Risiko',
  grundlagen: 'Grundlagenphase',
  bedingt_bestehensfaehig: 'Bedingt bestehensfähig',
  wahrscheinlich_bestehensfaehig: 'Wahrscheinlich bestehensfähig',
  pruefungsreif: 'Prüfungsreif',
  stabil_pruefungsreif: 'Stabil prüfungsreif',
};
