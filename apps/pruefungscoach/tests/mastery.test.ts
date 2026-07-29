import { describe, expect, it } from 'vitest';
import { applyAttempt, computeMastery, deriveStatus, INITIAL_SCORES } from '@/lib/domain/mastery';
import type { AttemptResult } from '@/lib/domain/types';

function result(overrides: Partial<AttemptResult> = {}): AttemptResult {
  return {
    correct: true,
    partial: false,
    pointsAwarded: 4,
    pointsMax: 4,
    errorCodes: [],
    helpLevel: 0,
    confidence: 'sicher',
    timeTakenSeconds: 60,
    overTime: false,
    ...overrides,
  };
}

describe('applyAttempt', () => {
  it('selbstständiger Erfolg erhöht die Dimension und Mastery', () => {
    const s = applyAttempt(INITIAL_SCORES, { family: 'recall', result: result(), daysSinceLastReview: 0, identicalRepeat: false });
    expect(s.recallScore).toBeGreaterThan(0.2);
    expect(s.mastery).toBeGreaterThan(0);
    expect(s.independentSuccesses).toBe(1);
  });

  it('Hilfe reduziert den Zuwachs (§3.4)', () => {
    const independent = applyAttempt(INITIAL_SCORES, { family: 'recall', result: result({ helpLevel: 0 }), daysSinceLastReview: 0, identicalRepeat: false });
    const helped = applyAttempt(INITIAL_SCORES, { family: 'recall', result: result({ helpLevel: 4 }), daysSinceLastReview: 0, identicalRepeat: false });
    expect(helped.recallScore).toBeLessThan(independent.recallScore);
    expect(helped.helpedSuccesses).toBe(1);
    expect(helped.independentSuccesses).toBe(0);
  });

  it('Raten reduziert den Zuwachs', () => {
    const sure = applyAttempt(INITIAL_SCORES, { family: 'recognition', result: result(), daysSinceLastReview: 0, identicalRepeat: false });
    const guessed = applyAttempt(INITIAL_SCORES, { family: 'recognition', result: result({ confidence: 'geraten' }), daysSinceLastReview: 0, identicalRepeat: false });
    expect(guessed.recognitionScore).toBeLessThan(sure.recognitionScore);
  });

  it('falsch + sehr sicher senkt stärker (kritisches Fehlkonzept)', () => {
    const base = { ...INITIAL_SCORES, recallScore: 0.8, mastery: computeMastery({ ...INITIAL_SCORES, recallScore: 0.8 }) };
    const unsure = applyAttempt(base, { family: 'recall', result: result({ correct: false, pointsAwarded: 0, confidence: 'eher_unsicher' }), daysSinceLastReview: 1, identicalRepeat: false });
    const overconfident = applyAttempt(base, { family: 'recall', result: result({ correct: false, pointsAwarded: 0, confidence: 'sehr_sicher' }), daysSinceLastReview: 1, identicalRepeat: false });
    expect(overconfident.recallScore).toBeLessThan(unsure.recallScore);
    expect(overconfident.confidenceCalibration).toBeLessThan(0.5);
  });

  it('Erfolg nach längerer Pause stärkt Stabilität', () => {
    const short = applyAttempt(INITIAL_SCORES, { family: 'recall', result: result(), daysSinceLastReview: 0, identicalRepeat: false });
    const long = applyAttempt(INITIAL_SCORES, { family: 'recall', result: result(), daysSinceLastReview: 7, identicalRepeat: false });
    expect(long.stabilityScore).toBeGreaterThan(short.stabilityScore);
  });

  it('Zeitüberschreitung senkt speedScore', () => {
    const base = { ...INITIAL_SCORES, speedScore: 0.5 };
    const s = applyAttempt(base, { family: 'speed', result: result({ overTime: true }), daysSinceLastReview: 0, identicalRepeat: false });
    expect(s.speedScore).toBeLessThan(0.5);
  });
});

describe('computeMastery (§13 Startformel)', () => {
  it('gewichtet 20/25/30/15/10', () => {
    const m = computeMastery({ ...INITIAL_SCORES, recognitionScore: 1, recallScore: 1, applicationScore: 1, transferScore: 1, stabilityScore: 1, speedScore: 1 });
    expect(m).toBe(1);
    const onlyRecognition = computeMastery({ ...INITIAL_SCORES, recognitionScore: 1 });
    expect(onlyRecognition).toBeCloseTo(0.2, 5);
  });
});

describe('deriveStatus (§7)', () => {
  it('unbekannt ohne Versuche', () => {
    expect(deriveStatus(INITIAL_SCORES, { masteryThreshold: 0.7, overdueDays: 0 })).toBe('unbekannt');
  });
  it('rückfallgefährdet bei überfälliger stabiler Kompetenz', () => {
    const s = { ...INITIAL_SCORES, attemptCount: 6, recognitionScore: 0.9, recallScore: 0.9, applicationScore: 0.9, transferScore: 0.8, stabilityScore: 0.7, speedScore: 0.6 };
    s.mastery = computeMastery(s);
    expect(deriveStatus(s, { masteryThreshold: 0.7, overdueDays: 10 })).toBe('rueckfallgefaehrdet');
    expect(deriveStatus(s, { masteryThreshold: 0.7, overdueDays: 0 })).toBe('pruefungssicher');
  });
});
