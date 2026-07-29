/**
 * Eingangsdiagnose (Masterbrief §17): Schnelltest 25–35 Aufgaben über die
 * sechs Diagnoseblöcke, breite Abdeckung vor Tiefe. Deterministisch.
 */
import type { MainArea, QuestionType } from './types';

export type DiagnosisBlock = 'grundlagen' | 'konstruktionen' | 'bauphysik' | 'planung' | 'rechnen' | 'sanierung';

export const BLOCK_LABELS: Record<DiagnosisBlock, string> = {
  grundlagen: 'Grundlagen',
  konstruktionen: 'Konstruktionen',
  bauphysik: 'Bauphysik',
  planung: 'Planung & Planlesen',
  rechnen: 'Rechnen',
  sanierung: 'Sanierung',
};

/** Aufgabenanteile je Block im Schnelltest (Summe = 1). */
const BLOCK_SHARES: Record<DiagnosisBlock, number> = {
  grundlagen: 0.15,
  konstruktionen: 0.25,
  bauphysik: 0.2,
  planung: 0.15,
  rechnen: 0.1,
  sanierung: 0.15,
};

export function blockForQuestion(mainArea: MainArea, qtype: QuestionType): DiagnosisBlock {
  if (qtype === 'number_unit') return 'rechnen';
  switch (mainArea) {
    case 'basics':
      return 'grundlagen';
    case 'planung':
      return 'planung';
    case 'bauphysik':
      return 'bauphysik';
    case 'sanierung':
      return 'sanierung';
    case 'trockenbaukonstruktionen':
    case 'sonderkonstruktionen':
    case 'dachgeschoss':
    case 'fussboden':
      return 'konstruktionen';
  }
}

export interface DiagnosisCandidate {
  id: string;
  mainArea: MainArea;
  qtype: QuestionType;
  examRelevance: number;
  difficulty: number;
  timeSeconds: number;
  primaryCompetencyId: string;
}

/**
 * Wählt den Schnelltest: pro Block nach Anteil, innerhalb des Blocks höchste
 * Prüfungsrelevanz, Schwierigkeitsspreizung (leicht→mittel→schwer) und
 * maximale Kompetenzabdeckung.
 */
export function assembleDiagnosis(candidates: DiagnosisCandidate[], totalTarget = 30): DiagnosisCandidate[] {
  const chosen: DiagnosisCandidate[] = [];
  const usedCompetencies = new Set<string>();

  for (const [block, share] of Object.entries(BLOCK_SHARES) as [DiagnosisBlock, number][]) {
    const want = Math.max(2, Math.round(totalTarget * share));
    const pool = candidates
      .filter((c) => blockForQuestion(c.mainArea, c.qtype) === block)
      .sort((a, b) => b.examRelevance - a.examRelevance || a.difficulty - b.difficulty);

    // Schwierigkeitsspreizung: erst leichte, dann mittlere, dann schwere
    const byDifficulty = [
      pool.filter((c) => c.difficulty <= 2),
      pool.filter((c) => c.difficulty === 3),
      pool.filter((c) => c.difficulty >= 4),
    ];
    let taken = 0;
    let tier = 0;
    while (taken < want && byDifficulty.some((t) => t.length > 0)) {
      const tierPool = byDifficulty[tier % 3]!;
      const idx = tierPool.findIndex((c) => !usedCompetencies.has(c.primaryCompetencyId) && !chosen.includes(c));
      const pickIdx = idx >= 0 ? idx : tierPool.findIndex((c) => !chosen.includes(c));
      if (pickIdx >= 0) {
        const pick = tierPool.splice(pickIdx, 1)[0]!;
        chosen.push(pick);
        usedCompetencies.add(pick.primaryCompetencyId);
        taken++;
      } else {
        byDifficulty[tier % 3] = [];
      }
      tier++;
    }
  }
  return chosen;
}
