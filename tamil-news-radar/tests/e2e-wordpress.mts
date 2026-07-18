// E2E-Test für das WordPress-Publishing gegen einen lokalen
// Mock-WordPress-Server (REST API /wp-json/wp/v2/posts + /media).
// Deckt ab: Beitrag anlegen/aktualisieren, Bild-Upload als Beitragsbild,
// Auth, HTML-Konvertierung, Quellenblock, Audit.
// Aufruf: pnpm test:wp  (setzt NO_PROXY für localhost)
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { DevStore } from '@tnr/database';
import { pushToWordPress } from '@tnr/editorial';
import { type ArticleDraft, type Story, newId, nowIso } from '@tnr/shared';

const PORT = 8932;
interface RecordedRequest { method: string; url: string; auth: string; body: string; contentType: string; disposition: string }
const requests: RecordedRequest[] = [];

// 1x1-Pixel-JPEG als Testbild
const FAKE_JPEG = Buffer.from('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAg=', 'base64');

const server = http.createServer((req, res) => {
  const chunks: Buffer[] = [];
  req.on('data', (c: Buffer) => chunks.push(c));
  req.on('end', () => {
    const url = req.url ?? '';
    if (url === '/test-image.jpg') {
      res.setHeader('Content-Type', 'image/jpeg');
      res.end(FAKE_JPEG);
      return;
    }
    requests.push({
      method: req.method ?? '', url,
      auth: req.headers.authorization ?? '',
      body: Buffer.concat(chunks).toString('utf8'),
      contentType: req.headers['content-type'] ?? '',
      disposition: String(req.headers['content-disposition'] ?? ''),
    });
    res.setHeader('Content-Type', 'application/json');
    if (url === '/wp-json/wp/v2/media') {
      res.end(JSON.stringify({ id: 55, source_url: 'http://127.0.0.1:8932/media/55.jpg' }));
    } else {
      res.end(JSON.stringify({ id: 123, link: 'http://localhost:8932/?p=123' }));
    }
  });
});
await new Promise<void>((resolve) => server.listen(PORT, resolve));

process.env.WORDPRESS_URL = `http://127.0.0.1:${PORT}`;
process.env.WORDPRESS_USER = 'admin';
process.env.WORDPRESS_APP_PASSWORD = 'test test test';
process.env.WORDPRESS_PUBLISH_STATUS = 'draft';

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tnr-wp-'));
const store = new DevStore(dir);

const draft: ArticleDraft = {
  headline: 'Testartikel für Tamil.de', headlineVariants: [], subheadline: 'Untertitel',
  summary: 'Kurzfassung.', body: 'Erster Absatz.\n\n## Zwischentitel\n\nZweiter Absatz & <test>.',
  tags: ['Test'], seoTitle: 'seo', metaDescription: 'meta', socialText: 'social',
  language: 'de',
  sources: [{ itemId: 'itm_1', url: 'https://example.org/a', sourceName: 'Quelle A', title: 'Titel A' }],
  uncertainNotes: [], generatedAt: nowIso(), generator: 'mock',
};
const story: Story = {
  id: newId('sty'), slug: 'test', workingTitle: 'Test', category: 'Tamil Nadu',
  status: 'approved', itemIds: ['itm_1'], draft,
  image: {
    url: `http://127.0.0.1:${PORT}/test-image.jpg`,
    caption: 'Testbild', credit: 'Tamil.de', license: 'eigenes Bild',
  },
  warnings: [], createdAt: nowIso(), updatedAt: nowIso(),
};
await store.insertStory(story);

// 1) Erster Push → Bild-Upload + Beitrag anlegen
const created = await pushToWordPress(store, story, 'test');
assert.equal(created.postId, 123);

const mediaUpload = requests.find((r) => r.url === '/wp-json/wp/v2/media');
assert.ok(mediaUpload, 'Bild wurde nicht in die Mediathek hochgeladen');
assert.equal(mediaUpload.contentType, 'image/jpeg');
assert.ok(mediaUpload.disposition.includes('tamilde-'), 'Dateiname fehlt im Upload');
assert.ok(mediaUpload.auth.startsWith('Basic '), 'Auth fehlt beim Media-Upload');

const captionUpdate = requests.find((r) => r.url === '/wp-json/wp/v2/media/55');
assert.ok(captionUpdate, 'Bildunterschrift wurde nicht gesetzt');
assert.ok(captionUpdate.body.includes('Testbild – Bild: Tamil.de'), 'Caption/Credit fehlen');

const postCreate = requests.find((r) => r.url === '/wp-json/wp/v2/posts');
assert.ok(postCreate, 'Beitrag wurde nicht angelegt');
const payload = JSON.parse(postCreate.body) as Record<string, unknown>;
assert.equal(payload.title, 'Testartikel für Tamil.de');
assert.equal(payload.status, 'draft');
assert.equal(payload.featured_media, 55, 'Beitragsbild nicht gesetzt');
assert.ok(String(payload.content).includes('<h2>Zwischentitel</h2>'), 'Markdown nicht konvertiert');
assert.ok(String(payload.content).includes('&amp; &lt;test&gt;'), 'HTML nicht escaped');
assert.ok(String(payload.content).includes('https://example.org/a'), 'Quellenblock fehlt');

// 2) Post-ID + Media-ID an der Story gespeichert
const stored = await store.getStory(story.id);
assert.equal(stored?.wordpressPostId, 123);
assert.equal(stored?.image?.wpMediaId, 55);

// 3) Zweiter Push → Update desselben Beitrags, KEIN erneuter Bild-Upload
const before = requests.length;
await pushToWordPress(store, stored!, 'test');
const newRequests = requests.slice(before);
assert.equal(newRequests.length, 1, 'Zweiter Push soll nur den Beitrag aktualisieren');
assert.equal(newRequests[0].url, '/wp-json/wp/v2/posts/123');

// 4) Audit-Trail
const audit = await store.listAudit();
assert.deepEqual(
  audit.map((a) => a.action).sort(),
  ['wordpress.create', 'wordpress.update']
);

server.close();
fs.rmSync(dir, { recursive: true, force: true });
console.log('WordPress-Publishing OK (Create, Update, Bild-Upload + Beitragsbild, Auth, HTML, Audit)');
