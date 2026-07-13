-- Prüfungscoach – Grundschema (Masterbrief §25)
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'learner' CHECK (role IN ('learner','admin')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS learner_profiles (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  beruf TEXT NOT NULL DEFAULT 'Trockenbaumonteur',
  lehrjahr INTEGER NOT NULL DEFAULT 3,
  exam_date TEXT NOT NULL,               -- ISO-Datum der schriftlichen Prüfung
  exam_part_focus TEXT NOT NULL DEFAULT 'beide' CHECK (exam_part_focus IN ('tk','san','beide')),
  goal TEXT NOT NULL DEFAULT 'bestehen',
  minutes_weekday INTEGER NOT NULL DEFAULT 60,
  minutes_weekend INTEGER NOT NULL DEFAULT 90,
  learn_time TEXT NOT NULL DEFAULT 'abends',
  focus_block_minutes INTEGER NOT NULL DEFAULT 25,
  self_assessment INTEGER NOT NULL DEFAULT 2,  -- 1–5
  adhs INTEGER NOT NULL DEFAULT 0,
  konzentration INTEGER NOT NULL DEFAULT 0,
  pruefungsangst INTEGER NOT NULL DEFAULT 0,
  rechenprobleme INTEGER NOT NULL DEFAULT 0,
  sprache INTEGER NOT NULL DEFAULT 0,
  mode TEXT NOT NULL DEFAULT 'regulaer',
  onboarded_at TEXT,
  diagnosed_at TEXT
);

CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  kind TEXT NOT NULL,                    -- originalpruefung | fachmaterial | arbeitsblatt | abschrift | ableitung | ki
  hierarchy_level INTEGER NOT NULL,      -- 1–6 (§27)
  status TEXT NOT NULL DEFAULT 'freigegeben',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS competencies (
  id TEXT PRIMARY KEY,
  parent_id TEXT REFERENCES competencies(id),
  main_area TEXT NOT NULL,
  topic TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  prerequisites TEXT NOT NULL DEFAULT '[]',   -- JSON string[]
  exam_relevance INTEGER NOT NULL,
  dependency_value INTEGER NOT NULL,
  points_potential INTEGER NOT NULL,
  learning_effort INTEGER NOT NULL,
  criticality INTEGER NOT NULL DEFAULT 0,
  mastery_threshold REAL NOT NULL DEFAULT 0.7,
  status TEXT NOT NULL DEFAULT 'freigegeben'
);

CREATE TABLE IF NOT EXISTS knowledge_objects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  competency_id TEXT NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
  source_id TEXT REFERENCES sources(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'freigegeben'
);

CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  source_id TEXT REFERENCES sources(id),
  source_level INTEGER NOT NULL,
  exam_part TEXT NOT NULL CHECK (exam_part IN ('tk','san')),
  family TEXT NOT NULL,
  operator TEXT NOT NULL,
  qtype TEXT NOT NULL,
  difficulty INTEGER NOT NULL,
  exam_relevance INTEGER NOT NULL,
  time_seconds INTEGER NOT NULL,
  points REAL NOT NULL,
  prompt TEXT NOT NULL,
  context TEXT,
  number_answer TEXT,        -- JSON NumberAnswer
  ordering_solution TEXT,    -- JSON string[]
  matching_pairs TEXT,       -- JSON {left,right}[]
  model_answer TEXT NOT NULL,
  typical_errors TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'freigegeben',
  version INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS question_competencies (
  question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  competency_id TEXT NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
  is_primary INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (question_id, competency_id)
);

CREATE TABLE IF NOT EXISTS choices (
  question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  text TEXT NOT NULL,
  correct INTEGER NOT NULL DEFAULT 0,
  error_code TEXT,
  explanation TEXT,
  PRIMARY KEY (question_id, id)
);

CREATE TABLE IF NOT EXISTS answer_criteria (
  question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  text TEXT NOT NULL,
  points REAL NOT NULL,
  required INTEGER NOT NULL DEFAULT 0,
  keywords TEXT NOT NULL DEFAULT '[]',
  synonyms TEXT NOT NULL DEFAULT '[]',
  misconception_codes TEXT NOT NULL DEFAULT '[]',
  PRIMARY KEY (question_id, id)
);

CREATE TABLE IF NOT EXISTS attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL REFERENCES questions(id),
  context TEXT NOT NULL CHECK (context IN ('diagnose','session','review','simulation')),
  plan_item_id INTEGER,
  sim_id INTEGER,
  answer_json TEXT NOT NULL,
  correct INTEGER NOT NULL,
  partial INTEGER NOT NULL DEFAULT 0,
  points_awarded REAL NOT NULL,
  points_max REAL NOT NULL,
  error_codes TEXT NOT NULL DEFAULT '[]',
  help_level INTEGER NOT NULL DEFAULT 0,
  confidence TEXT,
  time_taken_s INTEGER NOT NULL DEFAULT 0,
  over_time INTEGER NOT NULL DEFAULT 0,
  eval_source TEXT NOT NULL DEFAULT 'deterministic',  -- deterministic | ai
  eval_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON attempts(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_attempts_question ON attempts(user_id, question_id);

CREATE TABLE IF NOT EXISTS error_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  competency_id TEXT NOT NULL REFERENCES competencies(id),
  question_id TEXT REFERENCES questions(id),
  attempt_id INTEGER REFERENCES attempts(id),
  error_code TEXT NOT NULL,
  severity INTEGER NOT NULL DEFAULT 1,        -- 1–3, 3 = kritisch (z. B. falsch + sehr sicher)
  confidence TEXT,
  help_level INTEGER NOT NULL DEFAULT 0,
  misconception TEXT,
  next_intervention TEXT,
  resolved_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_error_events_user ON error_events(user_id, resolved_at);

CREATE TABLE IF NOT EXISTS learner_competencies (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  competency_id TEXT NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'unbekannt',
  recognition_score REAL NOT NULL DEFAULT 0,
  recall_score REAL NOT NULL DEFAULT 0,
  application_score REAL NOT NULL DEFAULT 0,
  transfer_score REAL NOT NULL DEFAULT 0,
  stability_score REAL NOT NULL DEFAULT 0,
  speed_score REAL NOT NULL DEFAULT 0,
  confidence_calibration REAL NOT NULL DEFAULT 0.5,
  mastery REAL NOT NULL DEFAULT 0,
  next_review_at TEXT,
  last_reviewed_at TEXT,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  independent_successes INTEGER NOT NULL DEFAULT 0,
  helped_successes INTEGER NOT NULL DEFAULT 0,
  incorrect_attempts INTEGER NOT NULL DEFAULT 0,
  last_error_type TEXT,
  PRIMARY KEY (user_id, competency_id)
);
CREATE INDEX IF NOT EXISTS idx_lc_review ON learner_competencies(user_id, next_review_at);

CREATE TABLE IF NOT EXISTS study_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_date TEXT NOT NULL,               -- ISO-Datum
  mode TEXT NOT NULL,
  minutes_target INTEGER NOT NULL,
  focus_area TEXT,
  summary_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (user_id, plan_date)
);

CREATE TABLE IF NOT EXISTS study_plan_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_id INTEGER NOT NULL REFERENCES study_plans(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('review','deficit','foundation','transfer','secure')),
  competency_id TEXT NOT NULL REFERENCES competencies(id),
  question_id TEXT REFERENCES questions(id),
  position INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','done','skipped')),
  completed_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_plan_items ON study_plan_items(plan_id, position);

CREATE TABLE IF NOT EXISTS simulations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('mini','teil','voll','belastung')),
  exam_part TEXT NOT NULL DEFAULT 'tk',
  time_limit_s INTEGER NOT NULL,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  submitted_at TEXT,
  score_json TEXT
);

CREATE TABLE IF NOT EXISTS simulation_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sim_id INTEGER NOT NULL REFERENCES simulations(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL REFERENCES questions(id),
  position INTEGER NOT NULL,
  answer_json TEXT,
  flagged INTEGER NOT NULL DEFAULT 0,
  points_awarded REAL,
  points_max REAL NOT NULL,
  error_codes TEXT NOT NULL DEFAULT '[]'
);
CREATE INDEX IF NOT EXISTS idx_sim_items ON simulation_items(sim_id, position);
