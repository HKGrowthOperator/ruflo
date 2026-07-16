// E2E-Test für das WordPress-Publishing gegen einen lokalen
// Mock-WordPress-Server (REST API /wp-json/wp/v2/posts).
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
interface RecordedRequest { method: string; url: string; auth: string; body: string }
const requests: RecordedRequest[] = [];

const server = http.createServer((req, res) => {
  let body = '';
  req.on('data', (chunk) => (body += chunk));
  req.on('end', () => {
    requests.push({
      method: req.method ?? '', url: req.url ?? '',
      auth: req.headers.authorization ?? '', body,
    });
    res.setHeader('Content-Type', 'application/json');
    const isUpdate = /\/posts\/\d+$/.test(req.url ?? '');
    res.end(JSON.stringify({ id: isUpdate ? 123 : 123, link: 'http://localhost:8932/?p=123' }));
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
  headline: 'சோதனை செய்தி', headlineVariants: [], subheadline: 'உபதலைப்பு',
  summary: 'சுருக்கம்.', body: 'முதல் பத்தி.\n\n## உபதலைப்பு\n\nஇரண்டாம் பத்தி & <test>.',
  tags: ['சோதனை'], seoTitle: 'seo', metaDescription: 'meta', socialText: 'social',
  language: 'ta',
  sources: [{ itemId: 'itm_1', url: 'https://example.org/a', sourceName: 'Quelle A', title: 'Titel A' }],
  uncertainNotes: [], generatedAt: nowIso(), generator: 'mock',
};
const story: Story = {
  id: newId('sty'), slug: 'test', workingTitle: 'Test', category: 'தமிழ்நாடு',
  status: 'approved', itemIds: ['itm_1'], draft, warnings: [],
  createdAt: nowIso(), updatedAt: nowIso(),
};
await store.insertStory(story);

// 1) Erster Push → POST /wp-json/wp/v2/posts (Create)
const created = await pushToWordPress(store, story, 'test');
assert.equal(created.postId, 123);
assert.equal(requests[0].method, 'POST');
assert.equal(requests[0].url, '/wp-json/wp/v2/posts');
assert.ok(requests[0].auth.startsWith('Basic '), 'Application-Password-Auth fehlt');
const payload = JSON.parse(requests[0].body) as { title: string; content: string; status: string };
assert.equal(payload.title, 'சோதனை செய்தி');
assert.equal(payload.status, 'draft');
assert.ok(payload.content.includes('<h2>உபதலைப்பு</h2>'), 'Markdown-Überschrift nicht konvertiert');
assert.ok(payload.content.includes('&amp; &lt;test&gt;'), 'HTML nicht escaped');
assert.ok(payload.content.includes('https://example.org/a'), 'Quellenblock fehlt');

// 2) Post-ID muss an der Story gespeichert sein
const stored = await store.getStory(story.id);
assert.equal(stored?.wordpressPostId, 123);

// 3) Zweiter Push → Update desselben Beitrags
await pushToWordPress(store, stored!, 'test');
assert.equal(requests[1].url, '/wp-json/wp/v2/posts/123');

// 4) Audit-Trail
const audit = await store.listAudit();
assert.deepEqual(
  audit.map((a) => a.action).sort(),
  ['wordpress.create', 'wordpress.update']
);

server.close();
fs.rmSync(dir, { recursive: true, force: true });
console.log('WordPress-Publishing OK (Create, Update, Auth, HTML, Audit)');
