// E2E-Runner: startet den Fixture-Feed-Server, führt die Pipeline-Tests
// in einem isolierten Datenverzeichnis aus und räumt danach auf.
// Aufruf: pnpm test:e2e
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tnr-e2e-'));
const server = spawn('node', ['tests/fixtures/feed-server.mjs'], { stdio: 'inherit' });

await new Promise((resolve) => setTimeout(resolve, 1000));

const result = spawnSync('pnpm', ['exec', 'tsx', 'tests/e2e-pipeline.mts'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    TNR_DATA_DIR: dataDir,
    NO_PROXY: [process.env.NO_PROXY, 'localhost,127.0.0.1'].filter(Boolean).join(','),
  },
});

server.kill();
fs.rmSync(dataDir, { recursive: true, force: true });
process.exit(result.status ?? 1);
