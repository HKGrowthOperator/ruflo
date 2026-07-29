/**
 * Seedet Quellen, Kompetenzen und Fragen aus seed/content/*.json (Zod-validiert)
 * sowie einen Admin- und einen Demo-Lerner-Account.
 * Idempotent: vorhandene Inhalte werden per UPSERT aktualisiert.
 *
 * Aufruf: npm run seed
 */
import fs from 'node:fs';
import path from 'node:path';
import { scryptSync, randomBytes } from 'node:crypto';
import { getDb } from '../src/lib/db';
import { zCompetencyFile, zQuestionFile, type CompetencySeed, type QuestionSeed } from '../src/lib/domain/seed-schema';

const db = getDb();
const contentDir = path.join(process.cwd(), 'seed', 'content');

// --- Quellenregister (Hierarchie §27) ---------------------------------------
const SOURCES: { id: string; title: string; kind: string; level: number }[] = [
  { id: 'pruefung-44', title: 'Originalprüfung "Prüfung 44" (IHK, OCR)', kind: 'originalpruefung', level: 1 },
  { id: 'pruefungsstruktur-notizen', title: 'Prüfungsstruktur & Lehrerhinweise (Coach-Notizen)', kind: 'arbeitsblatt', level: 3 },
  { id: 'wissensbuendelung', title: 'Arbeitsblätter abgeschrieben – Wissensbündelung', kind: 'abschrift', level: 4 },
  { id: 'hauptdatei', title: 'Fachbuch-Wissensbündelung (Buchinhalt mit Seitenangaben)', kind: 'abschrift', level: 4 },
  { id: 'didaktische-ableitung', title: 'Didaktische Ableitung aus freigegebenen Quellen', kind: 'ableitung', level: 5 },
];

const upsertSource = db.prepare(`
  INSERT INTO sources (id, title, kind, hierarchy_level, status) VALUES (?, ?, ?, ?, 'freigegeben')
  ON CONFLICT(id) DO UPDATE SET title = excluded.title, kind = excluded.kind, hierarchy_level = excluded.hierarchy_level
`);
for (const s of SOURCES) upsertSource.run(s.id, s.title, s.kind, s.level);

// --- Inhalte einlesen + validieren -------------------------------------------
if (!fs.existsSync(contentDir)) {
  console.error(`Seed-Verzeichnis fehlt: ${contentDir}`);
  process.exit(1);
}
const files = fs.readdirSync(contentDir).filter((f) => f.endsWith('.json'));
const competencies: CompetencySeed[] = [];
const questions: QuestionSeed[] = [];

for (const file of files) {
  const json = JSON.parse(fs.readFileSync(path.join(contentDir, file), 'utf8'));
  if (file.startsWith('competencies')) {
    competencies.push(...zCompetencyFile.parse(json).competencies);
  } else if (file.startsWith('questions')) {
    questions.push(...zQuestionFile.parse(json).questions);
  }
}

const compIds = new Set(competencies.map((c) => c.id));
for (const q of questions) {
  for (const cid of q.competency_ids) {
    if (!compIds.has(cid)) throw new Error(`${q.id}: unbekannte Kompetenz ${cid}`);
  }
}

// --- Upserts ------------------------------------------------------------------
const upsertComp = db.prepare(`
  INSERT INTO competencies (id, parent_id, main_area, topic, title, description, prerequisites,
    exam_relevance, dependency_value, points_potential, learning_effort, criticality, mastery_threshold, status)
  VALUES (@id, @parent_id, @main_area, @topic, @title, @description, @prerequisites,
    @exam_relevance, @dependency_value, @points_potential, @learning_effort, @criticality, @mastery_threshold, @status)
  ON CONFLICT(id) DO UPDATE SET
    parent_id = excluded.parent_id, main_area = excluded.main_area, topic = excluded.topic,
    title = excluded.title, description = excluded.description, prerequisites = excluded.prerequisites,
    exam_relevance = excluded.exam_relevance, dependency_value = excluded.dependency_value,
    points_potential = excluded.points_potential, learning_effort = excluded.learning_effort,
    criticality = excluded.criticality, mastery_threshold = excluded.mastery_threshold, status = excluded.status
`);

const upsertQuestion = db.prepare(`
  INSERT INTO questions (id, source_id, source_level, exam_part, family, operator, qtype, difficulty,
    exam_relevance, time_seconds, points, prompt, context, number_answer, ordering_solution,
    matching_pairs, model_answer, typical_errors, status, version)
  VALUES (@id, @source_id, @source_level, @exam_part, @family, @operator, @qtype, @difficulty,
    @exam_relevance, @time_seconds, @points, @prompt, @context, @number_answer, @ordering_solution,
    @matching_pairs, @model_answer, @typical_errors, @status, @version)
  ON CONFLICT(id) DO UPDATE SET
    source_id = excluded.source_id, source_level = excluded.source_level, exam_part = excluded.exam_part,
    family = excluded.family, operator = excluded.operator, qtype = excluded.qtype,
    difficulty = excluded.difficulty, exam_relevance = excluded.exam_relevance,
    time_seconds = excluded.time_seconds, points = excluded.points, prompt = excluded.prompt,
    context = excluded.context, number_answer = excluded.number_answer,
    ordering_solution = excluded.ordering_solution, matching_pairs = excluded.matching_pairs,
    model_answer = excluded.model_answer, typical_errors = excluded.typical_errors,
    status = excluded.status, version = excluded.version
`);

const delQc = db.prepare('DELETE FROM question_competencies WHERE question_id = ?');
const insQc = db.prepare('INSERT INTO question_competencies (question_id, competency_id, is_primary) VALUES (?, ?, ?)');
const delChoices = db.prepare('DELETE FROM choices WHERE question_id = ?');
const insChoice = db.prepare('INSERT INTO choices (question_id, id, text, correct, error_code, explanation) VALUES (?, ?, ?, ?, ?, ?)');
const delCriteria = db.prepare('DELETE FROM answer_criteria WHERE question_id = ?');
const insCriterion = db.prepare(`INSERT INTO answer_criteria
  (question_id, id, text, points, required, keywords, synonyms, misconception_codes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);

const seedAll = db.transaction(() => {
  for (const c of competencies) {
    upsertComp.run({ ...c, prerequisites: JSON.stringify(c.prerequisites) });
  }
  for (const q of questions) {
    upsertQuestion.run({
      id: q.id,
      source_id: q.source_ref,
      source_level: q.source_level,
      exam_part: q.exam_part,
      family: q.family,
      operator: q.operator,
      qtype: q.qtype,
      difficulty: q.difficulty,
      exam_relevance: q.exam_relevance,
      time_seconds: q.time_seconds,
      points: q.points,
      prompt: q.prompt,
      context: q.context,
      number_answer: q.number_answer ? JSON.stringify(q.number_answer) : null,
      ordering_solution: q.ordering_solution ? JSON.stringify(q.ordering_solution) : null,
      matching_pairs: q.matching_pairs ? JSON.stringify(q.matching_pairs) : null,
      model_answer: q.model_answer,
      typical_errors: JSON.stringify(q.typical_errors),
      status: q.status,
      version: q.version,
    });
    delQc.run(q.id);
    q.competency_ids.forEach((cid, i) => insQc.run(q.id, cid, i === 0 ? 1 : 0));
    delChoices.run(q.id);
    for (const ch of q.choices) insChoice.run(q.id, ch.id, ch.text, ch.correct ? 1 : 0, ch.error_code ?? null, ch.explanation ?? null);
    delCriteria.run(q.id);
    for (const cr of q.criteria) {
      insCriterion.run(q.id, cr.id, cr.text, cr.points, cr.required ? 1 : 0,
        JSON.stringify(cr.keywords), JSON.stringify(cr.synonyms), JSON.stringify(cr.misconception_codes));
    }
  }
});
seedAll();

// --- Demo-Accounts ------------------------------------------------------------
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

const insUser = db.prepare(`
  INSERT INTO users (email, password_hash, display_name, role) VALUES (?, ?, ?, ?)
  ON CONFLICT(email) DO NOTHING
`);
// In Produktion über ADMIN_EMAIL/ADMIN_PASSWORD setzen; Demo-Lerner nur anlegen,
// wenn kein eigenes Admin-Passwort gesetzt ist (lokaler Entwicklungsmodus).
const adminEmail = process.env.ADMIN_EMAIL || 'admin@coach.local';
const adminPassword = process.env.ADMIN_PASSWORD || 'admin1234';
insUser.run(adminEmail.toLowerCase(), hashPassword(adminPassword), 'Admin', 'admin');
if (!process.env.ADMIN_PASSWORD) {
  insUser.run('azubi@coach.local', hashPassword('azubi1234'), 'Azubi', 'learner');
}

// Demo-Accounts bekommen dauerhaften Vollzugang (damit sie auch mit aktivierter
// Bezahlung zum Testen funktionieren).
const grantAccess = db.prepare(`
  INSERT INTO entitlements (user_id, plan, source, granted_at)
  SELECT id, 'paid', 'admin', datetime('now') FROM users WHERE email = ?
  ON CONFLICT(user_id) DO UPDATE SET plan = 'paid', source = 'admin'
`);
grantAccess.run(adminEmail.toLowerCase());
if (!process.env.ADMIN_PASSWORD) grantAccess.run('azubi@coach.local');

const nComp = (db.prepare('SELECT COUNT(*) n FROM competencies').get() as { n: number }).n;
const nQ = (db.prepare('SELECT COUNT(*) n FROM questions').get() as { n: number }).n;
console.log(`Seed fertig: ${nComp} Kompetenzen, ${nQ} Fragen, ${SOURCES.length} Quellen.`);
if (process.env.ADMIN_PASSWORD) {
  console.log(`Admin-Account: ${adminEmail}`);
} else {
  console.log('Accounts: admin@coach.local/admin1234, azubi@coach.local/azubi1234');
}
