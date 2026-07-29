// End-to-End-Test der Pipeline gegen lokale Fixture-Feeds:
// Abruf → Dedupe → Clustering → Mock-Entwurf → Workflow → Veröffentlichung.
import { getStore } from '@tnr/database';
import { applyTransition } from '@tnr/editorial';
import { runRadar } from '@tnr/ingestion';
import { newId } from '@tnr/shared';

const store = getStore();

// Seed-Quellen deaktivieren (Netz ist in der Sandbox blockiert), lokale Fixtures anlegen
for (const source of await store.listSources()) {
  await store.updateSource(source.id, { enabled: false });
}
await store.insertSource({
  id: newId('src'), name: 'Fixture A', homepage: 'http://localhost:8931',
  feedUrl: 'http://localhost:8931/feed-a.xml', type: 'rss',
  language: 'ta', region: 'IN', trustScore: 80, enabled: true,
});
await store.insertSource({
  id: newId('src'), name: 'Fixture B', homepage: 'http://localhost:8931',
  feedUrl: 'http://localhost:8931/feed-b.xml', type: 'rss',
  language: 'en', region: 'IN', trustScore: 80, enabled: true,
});

// Lauf 1: Items einsammeln, clustern, Entwurf erstellen
const report1 = await runRadar('cli');
console.log('Lauf 1:', JSON.stringify(report1, null, 0));

// Lauf 2: Dedupe prüfen (keine neuen Items erwartet)
const report2 = await runRadar('cli');
console.log('Lauf 2 (Dedupe):', `newItems=${report2.newItems}`, `newStories=${report2.newStories}`);

const stories = await store.listStories();
console.log(`Stories: ${stories.length}`);
for (const story of stories) {
  console.log(` - [${story.status}] "${story.workingTitle}" items=${story.itemIds.length} draft=${!!story.draft} warnings=${story.warnings.length}`);
}

// Workflow: Entwurf → Prüfung → Freigabe → Veröffentlichung
const drafted = stories.find((s) => s.status === 'drafted');
if (!drafted) throw new Error('FEHLER: keine Story mit Entwurf (Clustering/Threshold prüfen)');
if (drafted.itemIds.length < 2) throw new Error('FEHLER: Cluster hat die zweite Quelle nicht zugeordnet');

let story = drafted;
story = await applyTransition(store, story, 'submit_review', 'e2e');
story = await applyTransition(store, story, 'approve', 'e2e');
story = await applyTransition(store, story, 'publish', 'e2e');
console.log(`Veröffentlicht: status=${story.status} slug=${story.slug} publishedAt=${story.publishedAt}`);

// Negativtest: publish aus falschem Status muss scheitern
try {
  await applyTransition(store, story, 'publish', 'e2e');
  throw new Error('FEHLER: doppeltes publish wurde nicht verhindert');
} catch (error) {
  console.log('Statusmaschine blockiert korrekt:', (error as Error).message);
}

const audit = await store.listAudit(10);
console.log('Audit-Einträge:', audit.map((a) => a.action).join(', '));
console.log('E2E OK');
