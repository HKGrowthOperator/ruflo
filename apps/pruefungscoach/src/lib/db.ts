import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

/**
 * SQLite-Zugriff (Singleton pro Prozess). Migrationen werden beim ersten
 * Zugriff idempotent angewendet, damit dev/build/seed reproduzierbar sind.
 */

const DEFAULT_PATH = path.join(process.cwd(), 'data', 'pruefungscoach.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;
  const dbPath = process.env.DATABASE_PATH || DEFAULT_PATH;
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  runMigrations(db);
  return db;
}

export function runMigrations(database: Database.Database): void {
  database.exec(`CREATE TABLE IF NOT EXISTS _migrations (
    name TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);
  const dir = path.join(process.cwd(), 'db', 'migrations');
  if (!fs.existsSync(dir)) return;
  const applied = new Set(
    (database.prepare('SELECT name FROM _migrations').all() as { name: string }[]).map((r) => r.name),
  );
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    const tx = database.transaction(() => {
      database.exec(sql);
      database.prepare('INSERT INTO _migrations (name) VALUES (?)').run(file);
    });
    tx();
  }
}

/** Nur für Tests/Skripte: In-Memory-DB mit Migrationen. */
export function createTestDb(): Database.Database {
  const mem = new Database(':memory:');
  mem.pragma('foreign_keys = ON');
  runMigrations(mem);
  return mem;
}
