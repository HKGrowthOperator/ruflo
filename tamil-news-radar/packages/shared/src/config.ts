import fs from 'node:fs';
import path from 'node:path';

/** Projektwurzel finden (Verzeichnis mit pnpm-workspace.yaml), damit
 *  Next.js (cwd = apps/web) und CLI-Skripte (cwd = Root) denselben
 *  Dev-Store verwenden. */
export function findProjectRoot(start: string = process.cwd()): string {
  let dir = start;
  for (let i = 0; i < 8; i++) {
    if (fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return start;
}

export interface RadarConfig {
  dataDir: string;
  minSourcesForDraft: number;
  minSourcesSensitive: number;
  clusterWindowHours: number;
  /** Jaccard-Schwellwert fürs Titel-Clustering */
  similarityThreshold: number;
  /** Max. Meldungen pro Quelle und Lauf */
  maxItemsPerSource: number;
}

export function getConfig(): RadarConfig {
  const root = findProjectRoot();
  return {
    dataDir: process.env.TNR_DATA_DIR || path.join(root, '.data'),
    minSourcesForDraft: intEnv('TNR_MIN_SOURCES_FOR_DRAFT', 2),
    minSourcesSensitive: intEnv('TNR_MIN_SOURCES_SENSITIVE', 3),
    clusterWindowHours: intEnv('TNR_CLUSTER_WINDOW_HOURS', 72),
    similarityThreshold: floatEnv('TNR_SIMILARITY_THRESHOLD', 0.42),
    maxItemsPerSource: intEnv('TNR_MAX_ITEMS_PER_SOURCE', 30),
  };
}

function intEnv(name: string, fallback: number): number {
  const v = parseInt(process.env[name] ?? '', 10);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

function floatEnv(name: string, fallback: number): number {
  const v = parseFloat(process.env[name] ?? '');
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

/** .env der Projektwurzel laden (Next lädt nur apps/web/.env). */
export function loadRootEnv(): void {
  try {
    const file = path.join(findProjectRoot(), '.env');
    if (fs.existsSync(file)) process.loadEnvFile(file);
  } catch {
    /* Node < 20.12 oder Datei fehlt – ignorieren */
  }
}
