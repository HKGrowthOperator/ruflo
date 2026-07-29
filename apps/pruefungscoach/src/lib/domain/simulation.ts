/**
 * Prüfungssimulation (Masterbrief §20) — deterministische Zusammenstellung.
 * Erste Verteilung: 30 % gebunden, 20 % freie Kurzantworten, 15 % Plan/Bild,
 * 15 % Rechnen, 10 % Systemauswahl, 10 % Projekt/Ablauf.
 */
import type { QuestionType } from './types';

export type SimKind = 'mini' | 'teil' | 'voll' | 'belastung';

export interface SimBlueprint {
  totalQuestions: number;
  timeLimitS: number;
  /** Zielanteile je Kategorie (Summe 1) */
  categoryShares: { category: SimCategory; share: number }[];
}

export type SimCategory = 'gebunden' | 'kurzantwort' | 'plan' | 'rechnen' | 'systemauswahl' | 'projekt';

export const CATEGORY_QTYPES: Record<SimCategory, QuestionType[]> = {
  gebunden: ['single_choice', 'multiple_choice', 'matching'],
  kurzantwort: ['short_text', 'long_text'],
  plan: ['plan_question', 'error_finder'],
  rechnen: ['number_unit'],
  systemauswahl: ['system_selection'],
  projekt: ['project', 'procedure', 'ordering'],
};

export function categoryOf(qtype: QuestionType): SimCategory {
  for (const [cat, types] of Object.entries(CATEGORY_QTYPES) as [SimCategory, QuestionType[]][]) {
    if (types.includes(qtype)) return cat;
  }
  return 'gebunden';
}

const DEFAULT_SHARES: { category: SimCategory; share: number }[] = [
  { category: 'gebunden', share: 0.3 },
  { category: 'kurzantwort', share: 0.2 },
  { category: 'plan', share: 0.15 },
  { category: 'rechnen', share: 0.15 },
  { category: 'systemauswahl', share: 0.1 },
  { category: 'projekt', share: 0.1 },
];

export function blueprintFor(kind: SimKind): SimBlueprint {
  switch (kind) {
    case 'mini':
      return { totalQuestions: 8, timeLimitS: 25 * 60, categoryShares: DEFAULT_SHARES };
    case 'teil':
      return { totalQuestions: 16, timeLimitS: 55 * 60, categoryShares: DEFAULT_SHARES };
    case 'voll':
      // angelehnt an den echten TK-Teil (150 min), reduziert auf machbare App-Länge
      return { totalQuestions: 28, timeLimitS: 110 * 60, categoryShares: DEFAULT_SHARES };
    case 'belastung':
      return { totalQuestions: 20, timeLimitS: 50 * 60, categoryShares: DEFAULT_SHARES };
  }
}

export interface SimCandidate {
  id: string;
  qtype: QuestionType;
  examPart: 'tk' | 'san';
  examRelevance: number;
  difficulty: number;
  points: number;
  primaryCompetencyId: string;
  mainArea: string;
  timesSeen: number;
}

/**
 * Wählt Fragen für die Simulation: Kategorie-Anteile einhalten, TK/SAN im
 * Verhältnis 62,5/37,5 (echte Gewichtung ohne WiSo), Kompetenzabdeckung
 * maximieren, zuletzt gesehene Fragen meiden. Deterministisch bei gleichem Input.
 */
export function assembleSimulation(candidates: SimCandidate[], kind: SimKind): SimCandidate[] {
  const bp = blueprintFor(kind);
  const chosen: SimCandidate[] = [];
  const usedCompetencies = new Set<string>();
  const usedAreas: Record<string, number> = {};
  let tkCount = 0;

  const targetTk = Math.round(bp.totalQuestions * 0.625);

  for (const { category, share } of bp.categoryShares) {
    const want = Math.max(1, Math.round(bp.totalQuestions * share));
    const pool = candidates
      .filter((c) => CATEGORY_QTYPES[category].includes(c.qtype) && !chosen.some((x) => x.id === c.id))
      .sort((a, b) => scoreCandidate(b) - scoreCandidate(a));

    for (let i = 0; i < want && pool.length > 0; ) {
      // bevorzugt: neue Kompetenz, passender Prüfungsteil, wenig gesehen
      let bestIdx = 0;
      let bestVal = -Infinity;
      for (let j = 0; j < pool.length; j++) {
        const c = pool[j]!;
        let v = scoreCandidate(c);
        if (!usedCompetencies.has(c.primaryCompetencyId)) v += 5;
        const needTk = tkCount < targetTk;
        if ((c.examPart === 'tk') === needTk) v += 3;
        v -= (usedAreas[c.mainArea] ?? 0) * 0.75;
        if (v > bestVal) {
          bestVal = v;
          bestIdx = j;
        }
      }
      const pick = pool.splice(bestIdx, 1)[0]!;
      chosen.push(pick);
      usedCompetencies.add(pick.primaryCompetencyId);
      usedAreas[pick.mainArea] = (usedAreas[pick.mainArea] ?? 0) + 1;
      if (pick.examPart === 'tk') tkCount++;
      i++;
    }
  }

  // Auffüllen, falls Kategorien zu dünn besetzt waren
  if (chosen.length < bp.totalQuestions) {
    const rest = candidates
      .filter((c) => !chosen.some((x) => x.id === c.id))
      .sort((a, b) => scoreCandidate(b) - scoreCandidate(a));
    for (const c of rest) {
      if (chosen.length >= bp.totalQuestions) break;
      chosen.push(c);
    }
  }

  return chosen.slice(0, bp.totalQuestions);
}

function scoreCandidate(c: SimCandidate): number {
  return c.examRelevance * 2 - c.timesSeen * 1.5 + (c.difficulty >= 2 && c.difficulty <= 4 ? 1 : 0);
}
