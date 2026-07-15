'use server';

import { revalidatePath } from 'next/cache';
import { getStore } from '@tnr/database';
import {
  applyTransition, canTransition, pushToWordPress, type TransitionAction,
} from '@tnr/editorial';
import { draftStory, refreshStory, runRadar } from '@tnr/ingestion';
import { type Source, newId, nowIso } from '@tnr/shared';

const ACTOR = 'admin';

function revalidateAll(): void {
  revalidatePath('/', 'layout');
}

/** Manueller Radar-Lauf ("Jetzt suchen", Frage 18). */
export async function runRadarAction(): Promise<void> {
  await runRadar('manual');
  revalidateAll();
}

/** "Aktualisieren" für eine Story (Frage 19/21). */
export async function refreshStoryAction(formData: FormData): Promise<void> {
  const id = String(formData.get('storyId') ?? '');
  await refreshStory(id, ACTOR);
  revalidateAll();
}

/** Entwurf manuell (neu) erstellen, auch unterhalb der Quellen-Schwelle. */
export async function draftStoryAction(formData: FormData): Promise<void> {
  const id = String(formData.get('storyId') ?? '');
  const store = getStore();
  const story = await store.getStory(id);
  if (!story) throw new Error('Story nicht gefunden');
  const items = await store.listItemsByIds(story.itemIds);
  if (items.length === 0) throw new Error('Story hat keine Quellenmeldungen');
  await draftStory(store, story, items, ACTOR);
  revalidateAll();
}

/** Statusübergang gemäß Statusmaschine (Frage 23/24). */
export async function transitionStoryAction(formData: FormData): Promise<void> {
  const id = String(formData.get('storyId') ?? '');
  const action = String(formData.get('action') ?? '') as TransitionAction;
  const note = String(formData.get('note') ?? '').trim() || undefined;
  const store = getStore();
  const story = await store.getStory(id);
  if (!story) throw new Error('Story nicht gefunden');
  if (!canTransition(story, action)) {
    throw new Error(`"${action}" ist im Status "${story.status}" nicht erlaubt`);
  }
  await applyTransition(store, story, action, ACTOR, note);
  revalidateAll();
}

/** Artikel zusätzlich nach WordPress pushen (optional konfiguriert). */
export async function pushWordPressAction(formData: FormData): Promise<void> {
  const id = String(formData.get('storyId') ?? '');
  const store = getStore();
  const story = await store.getStory(id);
  if (!story) throw new Error('Story nicht gefunden');
  await pushToWordPress(store, story, ACTOR);
  revalidateAll();
}

/** Quelle anlegen (Frage 15). */
export async function addSourceAction(formData: FormData): Promise<void> {
  const store = getStore();
  const name = String(formData.get('name') ?? '').trim();
  const feedUrl = String(formData.get('feedUrl') ?? '').trim();
  if (!name || !feedUrl) throw new Error('Name und Feed-URL sind Pflichtfelder');
  const source: Source = {
    id: newId('src'),
    name,
    feedUrl,
    homepage: String(formData.get('homepage') ?? '').trim() || feedUrl,
    type: formData.get('type') === 'google-news' ? 'google-news' : 'rss',
    language: (String(formData.get('language') ?? 'ta') as Source['language']) || 'ta',
    region: (String(formData.get('region') ?? 'IN') as Source['region']) || 'IN',
    trustScore: clampTrust(Number(formData.get('trustScore'))),
    enabled: true,
  };
  await store.insertSource(source);
  await store.addAudit({
    id: newId('aud'), at: nowIso(), actor: ACTOR,
    action: 'source.add', detail: `${name} (${feedUrl})`,
  });
  revalidateAll();
}

/** Quelle aktivieren/sperren (Frage 15). */
export async function toggleSourceAction(formData: FormData): Promise<void> {
  const store = getStore();
  const id = String(formData.get('sourceId') ?? '');
  const enabled = String(formData.get('enabled')) === 'true';
  await store.updateSource(id, { enabled });
  await store.addAudit({
    id: newId('aud'), at: nowIso(), actor: ACTOR,
    action: enabled ? 'source.enable' : 'source.disable', detail: id,
  });
  revalidateAll();
}

/** Vertrauens-Gewichtung einer Quelle ändern (Frage 15/42). */
export async function updateTrustAction(formData: FormData): Promise<void> {
  const store = getStore();
  const id = String(formData.get('sourceId') ?? '');
  const trustScore = clampTrust(Number(formData.get('trustScore')));
  await store.updateSource(id, { trustScore });
  await store.addAudit({
    id: newId('aud'), at: nowIso(), actor: ACTOR,
    action: 'source.trust', detail: `${id} → ${trustScore}`,
  });
  revalidateAll();
}

function clampTrust(value: number): number {
  if (!Number.isFinite(value)) return 70;
  return Math.max(0, Math.min(100, Math.round(value)));
}
