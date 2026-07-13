/**
 * Prioritätsformel (Masterbrief §14):
 *   Priorität = Prüfungsrelevanz × Defizit × Abhängigkeitswert × Punktepotenzial
 *             × Zeitfaktor × Fälligkeit ÷ Lernaufwand
 * Zusätzlich: kritisches Fehlkonzept, Abdeckung/Diagnosewert, Abwechslung,
 * Voraussetzungen.
 */
import type { PlanMode } from './types';

export interface PriorityInput {
  examRelevance: number; // 1–5
  mastery: number; // 0–1
  dependencyValue: number; // 1–3
  pointsPotential: number; // 1–5
  learningEffort: number; // 1–5
  mode: PlanMode;
  /** Stunden überfällig (0 wenn nicht fällig) */
  overdueHours: number;
  /** noch nie getestet → Diagnosewert */
  untested: boolean;
  /** ungelöstes kritisches Fehlkonzept (F16 / falsch+sehr sicher) */
  criticalMisconception: boolean;
  /** Anteil erfüllter Voraussetzungen 0–1 */
  prerequisiteReadiness: number;
  /** wie oft dieser Bereich heute schon dran war (Abwechslung) */
  areaRepetitionsToday: number;
}

/** Zeitfaktor: knappe Zeit → hohe Relevanz zählt überproportional. */
function timeFactor(mode: PlanMode, examRelevance: number): number {
  const urgency: Record<PlanMode, number> = {
    vollstaendig: 0,
    regulaer: 0.15,
    fokussiert: 0.3,
    intensiv: 0.5,
    bestehensmodus: 0.7,
    notfall: 0.9,
    punkterettung: 1.0,
  };
  const u = urgency[mode];
  // Relevanz 1–5 normiert; bei hoher Dringlichkeit werden irrelevante Themen stark gedämpft
  const rel = examRelevance / 5;
  return 1 + u * (rel * 2 - 1);
}

export function priorityScore(p: PriorityInput): number {
  const deficit = Math.max(0.05, 1 - p.mastery);
  const due = 1 + Math.min(3, p.overdueHours / 24);
  let score =
    (p.examRelevance * deficit * p.dependencyValue * p.pointsPotential * timeFactor(p.mode, p.examRelevance) * due) /
    Math.max(1, p.learningEffort);

  if (p.untested) score *= 1.4; // Diagnosewert
  if (p.criticalMisconception) score *= 1.8; // kritisches Fehlkonzept zuerst reparieren
  score *= 0.4 + 0.6 * p.prerequisiteReadiness; // fehlende Voraussetzungen dämpfen
  score *= 1 / (1 + 0.35 * p.areaRepetitionsToday); // Abwechslung/Interleaving

  // Punkterettung: nur noch schnell rückholbare Punkte (geringer Aufwand, hohe Relevanz)
  if (p.mode === 'punkterettung' && p.learningEffort >= 4) score *= 0.3;

  return score;
}
