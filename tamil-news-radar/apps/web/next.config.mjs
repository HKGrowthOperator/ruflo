import fs from 'node:fs';
import path from 'node:path';

// .env der Projektwurzel laden (Next selbst liest nur apps/web/.env*)
try {
  const rootEnv = path.resolve(process.cwd(), '../../.env');
  if (fs.existsSync(rootEnv)) process.loadEnvFile(rootEnv);
} catch {
  /* Node ohne loadEnvFile oder Datei fehlt – ignorieren */
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@tnr/shared',
    '@tnr/database',
    '@tnr/source-adapters',
    '@tnr/ingestion',
    '@tnr/ai',
    '@tnr/editorial',
  ],
};

export default nextConfig;
