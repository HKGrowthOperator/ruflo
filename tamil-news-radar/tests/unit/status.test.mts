import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { DevStore } from '@tnr/database';
import { applyTransition, canTransition } from '@tnr/editorial';
import { type ArticleDraft, type Story, newId, nowIso } from '@tnr/shared';

function makeDraft(): ArticleDraft {
  return {
    headline: 'சோதனை தலைப்பு', headlineVariants: [], subheadline: '', summary: 'சுருக்கம்',
    body: 'உள்ளடக்கம்', tags: [], seoTitle: 't', metaDescription: 'm', socialText: 's',
    language: 'ta', sources: [], uncertainNotes: [], generatedAt: nowIso(), generator: 'mock',
  };
}

function makeStory(status: Story['status'], withDraft = true): Story {
  const id = newId('sty');
  return {
    id, slug: id, workingTitle: 'Test', category: 'தமிழ்நாடு', status,
    itemIds: [], draft: withDraft ? makeDraft() : undefined, warnings: [],
    createdAt: nowIso(), updatedAt: nowIso(),
  };
}

test('canTransition erlaubt nur definierte Übergänge', () => {
  assert.ok(canTransition(makeStory('drafted'), 'submit_review'));
  assert.ok(canTransition(makeStory('in_review'), 'approve'));
  assert.ok(canTransition(makeStory('approved'), 'publish'));
  assert.ok(!canTransition(makeStory('drafted'), 'publish'));
  assert.ok(!canTransition(makeStory('detected'), 'approve'));
  assert.ok(!canTransition(makeStory('published'), 'publish'));
});

test('Freigabepfad setzt publishedAt und schreibt Audit-Log', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tnr-status-'));
  const store = new DevStore(dir);
  let story = makeStory('in_review');
  await store.insertStory(story);

  story = await applyTransition(store, story, 'approve', 'test');
  assert.equal(story.status, 'approved');
  story = await applyTransition(store, story, 'publish', 'test');
  assert.equal(story.status, 'published');
  assert.ok(story.publishedAt);

  const audit = await store.listAudit();
  assert.deepEqual(
    audit.map((a) => a.action).sort(),
    ['story.approve', 'story.publish']
  );
  fs.rmSync(dir, { recursive: true, force: true });
});

test('publish ohne Entwurf wird verweigert', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tnr-status-'));
  const store = new DevStore(dir);
  const story = makeStory('approved', false);
  await store.insertStory(story);
  await assert.rejects(
    () => applyTransition(store, story, 'publish', 'test'),
    /ohne Entwurf/
  );
  fs.rmSync(dir, { recursive: true, force: true });
});
