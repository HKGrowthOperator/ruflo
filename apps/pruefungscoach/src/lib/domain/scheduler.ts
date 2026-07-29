/**
 * Wiederholungsterminierung (Masterbrief §15) — Intervallleitern abhängig von
 * der Restzeit bis zur Prüfung, fehlerabhängig angepasst.
 */
import type { ErrorCode } from './types';

/** Intervalle in Tagen (Bruchteile = Stunden/Minuten am selben Tag). */
export function intervalLadder(daysToExam: number): number[] {
  if (daysToExam > 42) return [0, 1, 3, 7, 14, 30]; // mehrere Monate
  if (daysToExam > 13) return [0, 0.5, 1, 3, 7]; // 3–6 Wochen (und 2–6 Wochen)
  if (daysToExam > 2) {
    // 7-Tage-Fenster: sofort, 10–20 min, Abend, nächster Morgen, 2 Tage, Vortag
    return [0, 0.01, 0.3, 1, 2, Math.max(2, daysToExam - 1)];
  }
  // 1–2 Tage: sofort, 15 min, 2–3 h, Abend, Morgen
  return [0, 0.01, 0.1, 0.4, 1];
}

/** Schwere Fehler werfen weiter zurück als leichte (§15 "Fehlerabhängig anpassen"). */
export function stageAfterFailure(currentStage: number, errorCodes: ErrorCode[]): number {
  const critical = errorCodes.some((c) => c === 'F16' || c === 'F12' || c === 'F2' || c === 'F3');
  const minor = errorCodes.every((c) => c === 'F9' || c === 'F14' || c === 'F10' || c === 'F15');
  if (critical) return 0;
  if (minor && errorCodes.length > 0) return Math.max(0, currentStage - 1);
  return Math.max(0, currentStage - 2);
}

export function stageAfterSuccess(currentStage: number, helpLevel: number): number {
  // Erfolg mit starker Hilfe hält die Stufe, statt aufzusteigen (§3.4)
  if (helpLevel >= 3) return currentStage;
  return currentStage + 1;
}

export interface NextReviewInput {
  daysToExam: number;
  stage: number; // Wiederholungsstufe (0-basiert), nach Erfolg/Misserfolg bereits angepasst
  now: Date;
}

/** Liefert den nächsten Wiederholungszeitpunkt (ISO). Nie nach der Prüfung. */
export function nextReviewAt(input: NextReviewInput): string {
  const ladder = intervalLadder(input.daysToExam);
  const idx = Math.min(input.stage, ladder.length - 1);
  const days = ladder[idx] ?? 0;
  const cappedDays = Math.min(days, Math.max(0.01, input.daysToExam - 0.5));
  const t = new Date(input.now.getTime() + cappedDays * 86_400_000);
  return t.toISOString();
}

/**
 * Ableitung der aktuellen Stufe aus den Erfolgen: unabhängige Erfolge treiben
 * die Leiter, Fehlversuche wurden bereits über stageAfterFailure eingerechnet.
 * Persistiert wird die Stufe implizit über next_review_at + Erfolgstatistik;
 * für Robustheit rechnen wir sie konservativ aus den Zählern.
 */
export function estimateStage(independentSuccesses: number, incorrectAttempts: number): number {
  return Math.max(0, Math.min(5, independentSuccesses - Math.floor(incorrectAttempts / 2)));
}
