import { describe, expect, it } from 'vitest';
import {
  gradeChoice,
  gradeFreeTextDeterministic,
  gradeFreeTextFromHits,
  gradeMatching,
  gradeNumber,
  gradeOrdering,
} from '@/lib/domain/scoring';
import type { AnswerCriterion, Choice } from '@/lib/domain/types';

const choices: Choice[] = [
  { id: 'a', text: 'richtig', correct: true },
  { id: 'b', text: 'Verwechsler', correct: false, errorCode: 'F2' },
  { id: 'c', text: 'falsch', correct: false, errorCode: 'F1' },
  { id: 'd', text: 'falsch2', correct: false },
];

describe('gradeChoice single_choice', () => {
  it('volle Punkte bei richtiger Wahl', () => {
    const r = gradeChoice({ points: 3, qtype: 'single_choice' }, choices, ['a']);
    expect(r.correct).toBe(true);
    expect(r.pointsAwarded).toBe(3);
    expect(r.errorCodes).toEqual([]);
  });
  it('Distraktor-Fehlercode bei falscher Wahl', () => {
    const r = gradeChoice({ points: 3, qtype: 'single_choice' }, choices, ['b']);
    expect(r.correct).toBe(false);
    expect(r.pointsAwarded).toBe(0);
    expect(r.errorCodes).toEqual(['F2']);
  });
});

describe('gradeChoice multiple_choice', () => {
  const mc: Choice[] = [
    { id: 'a', text: '1', correct: true },
    { id: 'b', text: '2', correct: true },
    { id: 'c', text: '3', correct: false, errorCode: 'F6' },
    { id: 'd', text: '4', correct: false },
  ];
  it('Teilpunkte bei unvollständiger Auswahl', () => {
    const r = gradeChoice({ points: 4, qtype: 'multiple_choice' }, mc, ['a']);
    expect(r.partial).toBe(true);
    expect(r.pointsAwarded).toBe(2);
    expect(r.errorCodes).toContain('F10');
  });
  it('falsche Auswahl kostet Punkte, nie negativ', () => {
    const r = gradeChoice({ points: 4, qtype: 'multiple_choice' }, mc, ['a', 'c', 'd']);
    expect(r.pointsAwarded).toBe(0);
    expect(r.errorCodes).toContain('F6');
  });
});

describe('gradeNumber', () => {
  const expected = { value: 12.5, unit: 'm²', tolerance: 0.1 };
  it('Wert+Einheit korrekt → volle Punkte', () => {
    const r = gradeNumber({ points: 4 }, expected, 12.55, 'm2');
    expect(r.correct).toBe(true);
    expect(r.pointsAwarded).toBe(4);
  });
  it('richtiger Wert, fehlende Einheit → halbe Punkte + F14', () => {
    const r = gradeNumber({ points: 4 }, expected, 12.5, '');
    expect(r.pointsAwarded).toBe(2);
    expect(r.errorCodes).toContain('F14');
  });
  it('Rechenfehler (nahe dran) → F9', () => {
    const r = gradeNumber({ points: 4 }, expected, 13.4, 'm²');
    expect(r.pointsAwarded).toBe(0);
    expect(r.errorCodes).toContain('F9');
  });
  it('Größenordnungsfehler → Methodenfehler F8', () => {
    const r = gradeNumber({ points: 4 }, expected, 125, 'm²');
    expect(r.errorCodes).toContain('F8');
  });
});

describe('gradeOrdering', () => {
  const solution = ['Untergrund prüfen', 'Anreißen', 'UW-Profile dübeln', 'CW stellen', 'Beplanken'];
  it('exakte Reihenfolge → volle Punkte', () => {
    const r = gradeOrdering({ points: 5 }, solution, [...solution]);
    expect(r.correct).toBe(true);
    expect(r.pointsAwarded).toBe(5);
  });
  it('vertauschte Schritte → Teilpunkte', () => {
    const r = gradeOrdering({ points: 5 }, solution, ['Anreißen', 'Untergrund prüfen', 'UW-Profile dübeln', 'CW stellen', 'Beplanken']);
    expect(r.partial).toBe(true);
    expect(r.pointsAwarded).toBeGreaterThan(0);
    expect(r.pointsAwarded).toBeLessThan(5);
  });
});

describe('gradeMatching', () => {
  const sol = [
    { left: 'CW', right: 'Ständerprofil' },
    { left: 'UW', right: 'Anschlussprofil' },
    { left: 'UA', right: 'Aussteifungsprofil' },
  ];
  it('2 von 3 korrekt → 2/3 Punkte', () => {
    const r = gradeMatching({ points: 3 }, sol, [
      { left: 'CW', right: 'Ständerprofil' },
      { left: 'UW', right: 'Anschlussprofil' },
      { left: 'UA', right: 'Anschlussprofil' },
    ]);
    expect(r.pointsAwarded).toBe(2);
    expect(r.errorCodes).toContain('F2');
  });
});

const criteria: AnswerCriterion[] = [
  { id: 'K1', text: 'Entkopplung', points: 2, required: true, keywords: ['entkoppel', 'trenn'], synonyms: ['kein kontakt'], misconceptionCodes: [] },
  { id: 'K2', text: 'Schallbrücke', points: 1.5, required: true, keywords: ['schallbruecke', 'trittschall'], synonyms: [], misconceptionCodes: ['F3'] },
  { id: 'K3', text: 'Bewegung', points: 0.5, required: false, keywords: ['bewegung', 'ausdehnung'], synonyms: [], misconceptionCodes: [] },
];

describe('gradeFreeTextDeterministic', () => {
  it('sinngleiche Formulierung wird über Synonyme erkannt', () => {
    const r = gradeFreeTextDeterministic({ points: 4 }, criteria, 'Der Streifen sorgt dafür, dass der Estrich kein Kontakt zur Wand hat und der Trittschall nicht übertragen wird.');
    expect(r.metCriteria).toContain('K1');
    expect(r.metCriteria).toContain('K2');
    expect(r.pointsAwarded).toBe(3.5);
    expect(r.partial).toBe(true);
  });
  it('leere Antwort → Stufe 0, F1', () => {
    const r = gradeFreeTextDeterministic({ points: 4 }, criteria, '');
    expect(r.level).toBe(0);
    expect(r.pointsAwarded).toBe(0);
  });
  it('Umlaut-Normalisierung: "Schallbrücke" trifft Keyword', () => {
    const r = gradeFreeTextDeterministic({ points: 4 }, criteria, 'Er verhindert eine Schallbrücke. Er entkoppelt den Estrich. Bewegung wird aufgenommen.');
    expect(r.pointsAwarded).toBe(4);
    expect(r.correct).toBe(true);
    expect(r.level).toBe(3);
  });
});

describe('gradeFreeTextFromHits (KI-Treffer → Code summiert)', () => {
  it('Punkte = Summe getroffener Kriterien, gedeckelt', () => {
    const r = gradeFreeTextFromHits({ points: 4 }, criteria, new Set(['K1', 'K2', 'K3']));
    expect(r.pointsAwarded).toBe(4);
  });
  it('keine Punkte für erfundene Kriterien-IDs', () => {
    const r = gradeFreeTextFromHits({ points: 4 }, criteria, new Set(['K9']));
    expect(r.pointsAwarded).toBe(0);
  });
});
