/**
 * Validiert alle Seed-Inhaltsdateien gegen die Zod-Schemas und prüft Querbezüge
 * (Kompetenz-IDs in Fragen und prerequisites müssen existieren).
 *
 * Aufruf: npx tsx scripts/validate-seed.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { zCompetencyFile, zQuestionFile, type CompetencySeed, type QuestionSeed } from '../src/lib/domain/seed-schema';

const contentDir = path.join(__dirname, '..', 'seed', 'content');

function fail(msg: string): never {
  console.error(`❌ ${msg}`);
  process.exit(1);
}

if (!fs.existsSync(contentDir)) fail(`Seed-Verzeichnis fehlt: ${contentDir}`);

const files = fs.readdirSync(contentDir).filter((f) => f.endsWith('.json'));
const competencies: CompetencySeed[] = [];
const questions: QuestionSeed[] = [];
let errors = 0;

for (const file of files) {
  const raw = fs.readFileSync(path.join(contentDir, file), 'utf8');
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (e) {
    console.error(`❌ ${file}: kein valides JSON — ${(e as Error).message}`);
    errors++;
    continue;
  }
  const isCompetencyFile = file.startsWith('competencies');
  const schema = isCompetencyFile ? zCompetencyFile : zQuestionFile;
  const result = schema.safeParse(json);
  if (!result.success) {
    console.error(`❌ ${file}:`);
    for (const issue of result.error.issues.slice(0, 20)) {
      console.error(`   ${issue.path.join('.')}: ${issue.message}`);
    }
    errors++;
    continue;
  }
  if (isCompetencyFile) competencies.push(...(result.data as { competencies: CompetencySeed[] }).competencies);
  else questions.push(...(result.data as { questions: QuestionSeed[] }).questions);
  console.log(`✅ ${file}`);
}

// Querbezüge
const compIds = new Set(competencies.map((c) => c.id));
const dupC = competencies.map((c) => c.id).filter((id, i, a) => a.indexOf(id) !== i);
if (dupC.length) { console.error(`❌ doppelte Kompetenz-IDs: ${[...new Set(dupC)].join(', ')}`); errors++; }
const dupQ = questions.map((q) => q.id).filter((id, i, a) => a.indexOf(id) !== i);
if (dupQ.length) { console.error(`❌ doppelte Fragen-IDs: ${[...new Set(dupQ)].join(', ')}`); errors++; }

for (const c of competencies) {
  for (const p of c.prerequisites) {
    if (!compIds.has(p)) { console.error(`❌ ${c.id}: prerequisite ${p} existiert nicht`); errors++; }
  }
  if (c.parent_id && !compIds.has(c.parent_id)) {
    console.error(`❌ ${c.id}: parent_id ${c.parent_id} existiert nicht`); errors++;
  }
}
for (const q of questions) {
  for (const cid of q.competency_ids) {
    if (!compIds.has(cid)) { console.error(`❌ ${q.id}: Kompetenz ${cid} existiert nicht`); errors++; }
  }
}

// Abdeckung: jede Kompetenz sollte mindestens eine Frage haben
const covered = new Set(questions.flatMap((q) => q.competency_ids));
const uncovered = [...compIds].filter((id) => !covered.has(id));
if (uncovered.length) {
  console.warn(`⚠️  Kompetenzen ohne Fragen (${uncovered.length}): ${uncovered.join(', ')}`);
}

console.log(`\n${competencies.length} Kompetenzen, ${questions.length} Fragen, ${errors} Fehler`);
if (errors > 0) process.exit(1);
