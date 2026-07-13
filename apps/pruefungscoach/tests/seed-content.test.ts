/**
 * Inhaltsqualität (§31): Alle Seed-Dateien müssen dem Schema entsprechen,
 * Querbezüge stimmen, MC-Fragen korrekt gebaut sein und die Kriteriensummen
 * den Punktwerten entsprechen (das erzwingt bereits das Zod-Schema).
 */
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { zCompetencyFile, zQuestionFile, type CompetencySeed, type QuestionSeed } from '@/lib/domain/seed-schema';

const contentDir = path.join(__dirname, '..', 'seed', 'content');
const files = fs.existsSync(contentDir) ? fs.readdirSync(contentDir).filter((f) => f.endsWith('.json')) : [];

const competencies: CompetencySeed[] = [];
const questions: QuestionSeed[] = [];

describe('Seed-Inhalte', () => {
  it('mindestens je eine Kompetenz- und Fragendatei vorhanden', () => {
    expect(files.some((f) => f.startsWith('competencies'))).toBe(true);
    expect(files.some((f) => f.startsWith('questions'))).toBe(true);
  });

  for (const file of files) {
    it(`${file} entspricht dem Schema`, () => {
      const json = JSON.parse(fs.readFileSync(path.join(contentDir, file), 'utf8'));
      if (file.startsWith('competencies')) {
        const parsed = zCompetencyFile.parse(json);
        competencies.push(...parsed.competencies);
      } else {
        const parsed = zQuestionFile.parse(json);
        questions.push(...parsed.questions);
      }
    });
  }

  it('keine doppelten IDs', () => {
    const cIds = competencies.map((c) => c.id);
    const qIds = questions.map((q) => q.id);
    expect(new Set(cIds).size).toBe(cIds.length);
    expect(new Set(qIds).size).toBe(qIds.length);
  });

  it('alle Fragen-Kompetenzbezüge und prerequisites existieren', () => {
    const ids = new Set(competencies.map((c) => c.id));
    for (const q of questions) {
      for (const cid of q.competency_ids) expect(ids, `${q.id} → ${cid}`).toContain(cid);
    }
    for (const c of competencies) {
      for (const p of c.prerequisites) expect(ids, `${c.id} → ${p}`).toContain(p);
    }
  });

  it('umfangreiche Basis: >=100 Mikrokompetenzen, >=150 Fragen (Masterbrief Phase 1)', () => {
    expect(competencies.length).toBeGreaterThanOrEqual(100);
    expect(questions.length).toBeGreaterThanOrEqual(150);
  });

  it('alle acht Hauptbereiche abgedeckt', () => {
    const areas = new Set(competencies.map((c) => c.main_area));
    expect(areas.size).toBe(8);
  });

  it('Originalprüfungsfragen (Quellenstufe 1) vorhanden', () => {
    expect(questions.filter((q) => q.source_level === 1).length).toBeGreaterThanOrEqual(20);
  });

  it('jede Kompetenz hat mindestens eine Frage', () => {
    const covered = new Set(questions.flatMap((q) => q.competency_ids));
    const uncovered = competencies.filter((c) => !covered.has(c.id)).map((c) => c.id);
    expect(uncovered).toEqual([]);
  });

  it('beide Prüfungsteile (tk/san) vertreten', () => {
    const parts = new Set(questions.map((q) => q.exam_part));
    expect(parts.has('tk')).toBe(true);
    expect(parts.has('san')).toBe(true);
  });

  it('alle Fragenfamilien vertreten (§11)', () => {
    const fams = new Set(questions.map((q) => q.family));
    for (const f of ['recognition', 'recall', 'function', 'error_finding', 'application', 'transfer', 'speed']) {
      expect(fams, `Familie ${f} fehlt`).toContain(f);
    }
  });
});
