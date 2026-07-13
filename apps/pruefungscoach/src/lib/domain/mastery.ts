/**
 * Mastery-System (Masterbrief §13) — rein deterministisch.
 *
 * Startformel:
 *   Mastery = 0,20·Erkennen + 0,25·freier Abruf + 0,30·Anwendung
 *           + 0,15·Stabilität + 0,10·Zeitdruck
 * Anwendung = 0,75·application + 0,25·transfer (Transfer zählt zur Anwendung).
 *
 * Hilfe reduziert den Beherrschungszuwachs (§3.4), Raten ebenfalls (§5).
 */
import type { AttemptResult, CompetencyStatus, Confidence, HelpLevel, QuestionFamily } from './types';

export interface CompetencyScores {
  recognitionScore: number;
  recallScore: number;
  applicationScore: number;
  transferScore: number;
  stabilityScore: number;
  speedScore: number;
  confidenceCalibration: number;
  mastery: number;
  attemptCount: number;
  independentSuccesses: number;
  helpedSuccesses: number;
  incorrectAttempts: number;
}

export const INITIAL_SCORES: CompetencyScores = {
  recognitionScore: 0,
  recallScore: 0,
  applicationScore: 0,
  transferScore: 0,
  stabilityScore: 0,
  speedScore: 0,
  confidenceCalibration: 0.5,
  mastery: 0,
  attemptCount: 0,
  independentSuccesses: 0,
  helpedSuccesses: 0,
  incorrectAttempts: 0,
};

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** Hilfestufe → Faktor auf den Lernzuwachs (0 = selbstständig … 5 = Musterlösung gelesen) */
export const HELP_FACTORS: Record<HelpLevel, number> = { 0: 1, 1: 0.8, 2: 0.6, 3: 0.4, 4: 0.25, 5: 0.1 };

/** Sicherheit → numerischer Wert für Kalibrierung */
export const CONFIDENCE_VALUES: Record<Confidence, number> = {
  geraten: 0.1,
  eher_unsicher: 0.3,
  teilweise_sicher: 0.55,
  sicher: 0.8,
  sehr_sicher: 0.95,
};

export function computeMastery(s: CompetencyScores): number {
  const anwendung = 0.75 * s.applicationScore + 0.25 * s.transferScore;
  return clamp01(
    0.2 * s.recognitionScore +
      0.25 * s.recallScore +
      0.3 * anwendung +
      0.15 * s.stabilityScore +
      0.1 * s.speedScore,
  );
}

/** Welche Score-Dimension eine Fragenfamilie primär trainiert. */
export function dimensionForFamily(family: QuestionFamily): keyof CompetencyScores {
  switch (family) {
    case 'recognition':
      return 'recognitionScore';
    case 'recall':
    case 'function':
      return 'recallScore';
    case 'application':
    case 'error_finding':
      return 'applicationScore';
    case 'transfer':
      return 'transferScore';
    case 'speed':
      return 'speedScore';
  }
}

export interface MasteryUpdateInput {
  family: QuestionFamily;
  result: AttemptResult;
  /** Tage seit letzter Wiederholung dieser Kompetenz (0 wenn erste) */
  daysSinceLastReview: number;
  /** identische Frage kurz hintereinander → abgeschwächt (§13) */
  identicalRepeat: boolean;
}

/**
 * Aktualisiert die Scores nach einem Versuch. EMA-Update auf der trainierten
 * Dimension; Stabilität wächst nur bei selbstständigem Erfolg nach Pause.
 */
export function applyAttempt(prev: CompetencyScores, input: MasteryUpdateInput): CompetencyScores {
  const s: CompetencyScores = { ...prev };
  const { result } = input;
  let quality = result.pointsMax > 0 ? result.pointsAwarded / result.pointsMax : 0;
  // Zeitdruck-Aufgaben: Überziehen der Sollzeit entwertet den Erfolg
  if (input.family === 'speed' && result.overTime) quality *= 0.3;
  const success = quality >= 0.6;
  const helpFactor = HELP_FACTORS[result.helpLevel];

  // Abschwächungen (§13): Raten, identische Wiederholung
  let gainFactor = helpFactor;
  if (result.confidence === 'geraten') gainFactor *= 0.4;
  if (input.identicalRepeat) gainFactor *= 0.5;

  // Verstärkungen (§13): längere Pause, korrekte hohe Sicherheit
  if (success && input.daysSinceLastReview >= 3) gainFactor *= 1.2;
  if (success && (result.confidence === 'sicher' || result.confidence === 'sehr_sicher')) gainFactor *= 1.1;
  gainFactor = Math.min(gainFactor, 1.3);

  const dim = dimensionForFamily(input.family);
  const target = quality * gainFactor;
  const prevVal = s[dim] as number;
  if (success) {
    (s[dim] as number) = clamp01(prevVal + 0.35 * Math.max(0, target - prevVal) + 0.05 * gainFactor);
  } else {
    // Misserfolg senkt die Dimension deutlich; sehr sicher + falsch = kritisch
    const drop = result.confidence === 'sehr_sicher' ? 0.35 : 0.25;
    (s[dim] as number) = clamp01(prevVal - drop * (1 - quality));
  }

  // Wissensleiter: Erfolg auf höherer Stufe hebt niedrigere Stufen leicht an
  if (success) {
    if (dim === 'recallScore') s.recognitionScore = clamp01(Math.max(s.recognitionScore, 0.5 * quality + 0.3));
    if (dim === 'applicationScore' || dim === 'transferScore') {
      s.recognitionScore = clamp01(Math.max(s.recognitionScore, 0.4 + 0.4 * quality));
      s.recallScore = clamp01(Math.max(s.recallScore, 0.3 + 0.4 * quality));
    }
  }

  // Stabilität: nur selbstständige Erfolge nach Pause zählen; Misserfolg senkt
  if (success && result.helpLevel <= 1) {
    const gapBonus = Math.min(1, input.daysSinceLastReview / 7);
    s.stabilityScore = clamp01(s.stabilityScore + 0.3 * gapBonus + 0.02);
  } else if (!success) {
    s.stabilityScore = clamp01(s.stabilityScore - 0.3);
  }

  // Zeitdruck: Erfolg innerhalb der Sollzeit verbessert speedScore
  if (success && !result.overTime) {
    s.speedScore = clamp01(s.speedScore + 0.25 * (1 - s.speedScore));
  } else if (result.overTime) {
    s.speedScore = clamp01(s.speedScore - 0.15);
  }

  // Kalibrierung: 1 = Sicherheit passt zur Leistung
  if (result.confidence) {
    const conf = CONFIDENCE_VALUES[result.confidence];
    const fit = 1 - Math.abs(conf - quality);
    s.confidenceCalibration = clamp01(0.7 * s.confidenceCalibration + 0.3 * fit);
  }

  s.attemptCount += 1;
  if (success && result.helpLevel <= 1) s.independentSuccesses += 1;
  else if (success) s.helpedSuccesses += 1;
  else s.incorrectAttempts += 1;

  s.mastery = computeMastery(s);
  return s;
}

/** Statusableitung (§7) — deterministisch aus den Scores. */
export function deriveStatus(s: CompetencyScores, opts: { masteryThreshold: number; overdueDays: number }): CompetencyStatus {
  if (s.attemptCount === 0) return 'unbekannt';
  const wasStable = s.mastery >= opts.masteryThreshold && s.stabilityScore >= 0.5;
  if (wasStable && opts.overdueDays > 7) return 'rueckfallgefaehrdet';
  if (s.mastery >= 0.8 && s.stabilityScore >= 0.6 && s.speedScore >= 0.5) return 'pruefungssicher';
  if (wasStable) return 'stabil';
  if (0.75 * s.applicationScore + 0.25 * s.transferScore >= 0.6) return 'anwendbar';
  if (s.recallScore >= 0.6) return 'abrufbar';
  if (s.recognitionScore >= 0.6) return 'erkannt';
  if (s.mastery < 0.35 && s.incorrectAttempts >= 2) return 'defizit';
  return 'begonnen';
}
