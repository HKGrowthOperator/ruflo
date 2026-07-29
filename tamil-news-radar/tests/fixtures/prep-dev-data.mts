// Demo-/Testdaten in den Dev-Store laden: deaktiviert die Seed-Quellen,
// registriert die lokalen Fixture-Feeds und lässt das Radar einmal laufen.
// Voraussetzung: `node tests/fixtures/feed-server.mjs` läuft.
// Aufruf: pnpm exec tsx tests/fixtures/prep-dev-data.mts
import { getStore } from '@tnr/database';
import { runRadar } from '@tnr/ingestion';
import { newId } from '@tnr/shared';

const store = getStore();
for (const source of await store.listSources()) {
  await store.updateSource(source.id, { enabled: false });
}
for (const feed of ['a', 'b'] as const) {
  await store.insertSource({
    id: newId('src'),
    name: `Fixture ${feed.toUpperCase()}`,
    homepage: 'http://localhost:8931',
    feedUrl: `http://localhost:8931/feed-${feed}.xml`,
    type: 'rss',
    language: feed === 'a' ? 'ta' : 'en',
    region: 'IN',
    trustScore: 80,
    enabled: true,
  });
}
const report = await runRadar('cli');
console.log(`Demo-Daten geladen: ${report.newStories} Stories, ${report.draftsCreated} Entwürfe`);
