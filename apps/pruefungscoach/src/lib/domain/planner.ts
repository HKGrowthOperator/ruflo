/**
 * Tagesplan (Masterbrief §18): Tagesmix, Auswahl der Kompetenzen nach
 * Priorität (§14) und fälligen Wiederholungen (§15). Deterministisch.
 */
import { priorityScore, type PriorityInput } from './priority';
import type { PlanMode } from './types';

export type PlanItemKind = 'review' | 'deficit' | 'foundation' | 'transfer' | 'secure';

/** Tagesmix normal (§18); Modi verschieben die Anteile. */
export function dailyMix(mode: PlanMode): Record<PlanItemKind, number> {
  switch (mode) {
    case 'punkterettung':
      return { review: 0.35, deficit: 0.15, foundation: 0.05, transfer: 0.05, secure: 0.4 };
    case 'notfall':
      return { review: 0.3, deficit: 0.3, foundation: 0.1, transfer: 0.1, secure: 0.2 };
    case 'bestehensmodus':
      return { review: 0.25, deficit: 0.3, foundation: 0.15, transfer: 0.15, secure: 0.15 };
    case 'intensiv':
      return { review: 0.25, deficit: 0.25, foundation: 0.2, transfer: 0.15, secure: 0.15 };
    default:
      return { review: 0.2, deficit: 0.25, foundation: 0.2, transfer: 0.2, secure: 0.15 };
  }
}

export interface PlannerCompetency {
  id: string;
  mainArea: string;
  mastery: number;
  status: string;
  examRelevance: number;
  dependencyValue: number;
  pointsPotential: number;
  learningEffort: number;
  nextReviewAt: string | null;
  untested: boolean;
  criticalMisconception: boolean;
  prerequisiteReadiness: number;
}

export interface PlannedItem {
  kind: PlanItemKind;
  competencyId: string;
  priority: number;
}

/** Durchschnittliche Minuten pro Aufgabe inkl. Feedback (konservativ). */
export const MINUTES_PER_ITEM = 3.5;

/**
 * Erzeugt die Tagesliste: erst fällige Wiederholungen, dann nach Mix und
 * Priorität gefüllt. Interleaving über areaRepetitions-Dämpfung.
 */
export function buildDailyPlan(
  competencies: PlannerCompetency[],
  opts: { mode: PlanMode; minutes: number; now: Date },
): PlannedItem[] {
  const totalItems = Math.max(4, Math.min(40, Math.round(opts.minutes / MINUTES_PER_ITEM)));
  const mix = dailyMix(opts.mode);
  const areaCount: Record<string, number> = {};
  const picked = new Set<string>();
  const items: PlannedItem[] = [];

  const scoreFor = (c: PlannerCompetency): number => {
    const overdueHours = c.nextReviewAt ? Math.max(0, (opts.now.getTime() - new Date(c.nextReviewAt).getTime()) / 3_600_000) : 0;
    const input: PriorityInput = {
      examRelevance: c.examRelevance,
      mastery: c.mastery,
      dependencyValue: c.dependencyValue,
      pointsPotential: c.pointsPotential,
      learningEffort: c.learningEffort,
      mode: opts.mode,
      overdueHours,
      untested: c.untested,
      criticalMisconception: c.criticalMisconception,
      prerequisiteReadiness: c.prerequisiteReadiness,
      areaRepetitionsToday: areaCount[c.mainArea] ?? 0,
    };
    return priorityScore(input);
  };

  const take = (kind: PlanItemKind, pool: PlannerCompetency[], count: number) => {
    for (let i = 0; i < count; i++) {
      const candidates = pool.filter((c) => !picked.has(c.id));
      if (candidates.length === 0) return;
      let best: PlannerCompetency | null = null;
      let bestScore = -1;
      for (const c of candidates) {
        const s = scoreFor(c);
        if (s > bestScore) {
          bestScore = s;
          best = c;
        }
      }
      if (!best) return;
      picked.add(best.id);
      areaCount[best.mainArea] = (areaCount[best.mainArea] ?? 0) + 1;
      items.push({ kind, competencyId: best.id, priority: bestScore });
    }
  };

  const due = competencies.filter((c) => c.nextReviewAt && new Date(c.nextReviewAt) <= opts.now);
  const deficits = competencies.filter((c) => c.status === 'defizit' || (c.mastery < 0.45 && !c.untested));
  const foundations = competencies.filter((c) => c.untested || c.status === 'unbekannt' || c.status === 'begonnen');
  const transfers = competencies.filter((c) => c.mastery >= 0.45 && c.mastery < 0.75);
  const secures = competencies.filter((c) => c.mastery >= 0.6);

  // Fällige Wiederholungen zuerst — mindestens der Mix-Anteil, höchstens die Hälfte des Tages
  const reviewCount = Math.min(due.length, Math.max(Math.round(totalItems * mix.review), Math.min(due.length, Math.round(totalItems * 0.5))));
  take('review', due, reviewCount);
  take('deficit', deficits, Math.round(totalItems * mix.deficit));
  take('foundation', foundations, Math.round(totalItems * mix.foundation));
  take('transfer', transfers, Math.round(totalItems * mix.transfer));
  take('secure', secures, Math.round(totalItems * mix.secure));

  // Rest auffüllen mit global bester Priorität
  while (items.length < totalItems) {
    const rest = competencies.filter((c) => !picked.has(c.id));
    if (rest.length === 0) break;
    take('deficit', rest, 1);
  }

  return items;
}

/**
 * Aufgabenauswahl je Kompetenz: gewünschte Schwierigkeit ~ 60–80 % Erfolgs-
 * wahrscheinlichkeit (§5 Desirable Difficulty) → Ziel = mastery*5 ± 1.
 */
export function desiredDifficulty(mastery: number): { min: number; max: number } {
  const center = Math.max(1, Math.min(5, Math.round(mastery * 5) + 1));
  return { min: Math.max(1, center - 1), max: Math.min(5, center + 1) };
}
