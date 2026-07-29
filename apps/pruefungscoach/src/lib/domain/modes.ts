import type { PlanMode } from './types';

/** Automatische Modi nach Restzeit bis zur Prüfung (Masterbrief §16). */
export function planModeForDaysLeft(daysLeft: number): PlanMode {
  if (daysLeft > 84) return 'vollstaendig'; // > 12 Wochen
  if (daysLeft >= 42) return 'regulaer'; // 6–12 Wochen
  if (daysLeft >= 21) return 'fokussiert'; // 3–6 Wochen
  if (daysLeft >= 14) return 'intensiv'; // 14–20 Tage
  if (daysLeft >= 7) return 'bestehensmodus'; // 7–13 Tage
  if (daysLeft >= 3) return 'notfall'; // 3–6 Tage
  return 'punkterettung'; // 1–2 Tage
}

export const PLAN_MODE_LABELS: Record<PlanMode, string> = {
  vollstaendig: 'Vollständiger Aufbau',
  regulaer: 'Regulärer Plan',
  fokussiert: 'Fokussierter Plan',
  intensiv: 'Intensivmodus',
  bestehensmodus: 'Bestehensmodus',
  notfall: 'Notfallmodus',
  punkterettung: 'Punkterettung',
};

export function daysUntil(dateIso: string, now: Date = new Date()): number {
  const exam = new Date(`${dateIso.slice(0, 10)}T08:00:00`);
  const ms = exam.getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}
