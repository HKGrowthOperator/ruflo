/**
 * Wendet alle SQL-Migrationen an. Mit --reset wird die DB-Datei vorher gelöscht.
 * Aufruf: npm run migrate [-- --reset]
 */
import fs from 'node:fs';
import path from 'node:path';

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'pruefungscoach.db');

if (process.argv.includes('--reset')) {
  for (const suffix of ['', '-wal', '-shm']) {
    const p = `${dbPath}${suffix}`;
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
  console.log(`DB zurückgesetzt: ${dbPath}`);
}

// Import nach dem Reset, damit getDb() eine frische Datei anlegt.
import('../src/lib/db').then(({ getDb }) => {
  getDb();
  console.log(`Migrationen angewendet: ${dbPath}`);
});
