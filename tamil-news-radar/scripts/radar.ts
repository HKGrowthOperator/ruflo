/**
 * Radar-CLI: einmaliger Lauf oder Dauerschleife.
 *   pnpm radar               # ein Lauf
 *   pnpm radar:loop          # alle 30 Minuten (Docker/Server ohne Vercel Cron)
 *   pnpm radar -- --loop 15  # eigenes Intervall in Minuten
 */
import { loadRootEnv } from '@tnr/shared';
import { runRadar } from '@tnr/ingestion';

loadRootEnv();

const args = process.argv.slice(2);
const loopIndex = args.indexOf('--loop');
const intervalMinutes = loopIndex >= 0 ? Math.max(5, parseInt(args[loopIndex + 1] ?? '30', 10) || 30) : 0;

async function once(): Promise<void> {
  const report = await runRadar('cli');
  console.log(
    `[radar] ${report.finishedAt} – Quellen ${report.sourcesOk}/${report.sourcesTotal} ok, ` +
      `${report.newItems} neue Meldungen, ${report.newStories} neue Stories, ` +
      `${report.draftsCreated} Entwürfe`
  );
  for (const failure of report.sourcesFailed) {
    console.warn(`[radar]   Fehler bei ${failure.name}: ${failure.error}`);
  }
}

async function main(): Promise<void> {
  if (intervalMinutes > 0) {
    console.log(`[radar] Dauerbetrieb, Intervall ${intervalMinutes} Minuten. Strg+C zum Beenden.`);
    const tick = () =>
      once().catch((error) => console.error('[radar] Lauf fehlgeschlagen:', error));
    await tick();
    setInterval(tick, intervalMinutes * 60_000);
  } else {
    await once();
  }
}

main().catch((error) => {
  console.error('[radar] Fataler Fehler:', error);
  process.exitCode = 1;
});
