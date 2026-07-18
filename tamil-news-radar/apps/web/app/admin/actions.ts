'use server';

import { revalidatePath } from 'next/cache';
import { getStore } from '@tnr/database';
import {
  applyTransition, canTransition, isAutoPushEnabled, pushToWordPress,
  type TransitionAction,
} from '@tnr/editorial';
import { draftStory, refreshStory, runRadar } from '@tnr/ingestion';
import { type Source, type Story, newId, nowIso, slugify } from '@tnr/shared';

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

/**
 * Statusübergang gemäß Statusmaschine (Frage 23/24).
 * Beim Veröffentlichen wird der Artikel automatisch nach WordPress
 * gepusht (inkl. Beitragsbild), sofern WordPress konfiguriert ist –
 * das ist der primäre Veröffentlichungskanal von Tamil.de.
 * Abschaltbar mit WORDPRESS_AUTO_PUSH=false.
 */
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
  const updated = await applyTransition(store, story, action, ACTOR, note);

  if (action === 'publish' && isAutoPushEnabled()) {
    try {
      await pushToWordPress(store, updated, ACTOR);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await store.updateStory(id, {
        warnings: [...updated.warnings, `WordPress-Push fehlgeschlagen: ${message}`],
        updatedAt: nowIso(),
      });
      await store.addAudit({
        id: newId('aud'), at: nowIso(), actor: ACTOR,
        action: 'wordpress.error', storyId: id, detail: message.slice(0, 300),
      });
    }
  }
  revalidateAll();
}

/** Artikelbild setzen (Fragen 44–47). Rechte vorher klären! */
export async function setImageAction(formData: FormData): Promise<void> {
  const id = String(formData.get('storyId') ?? '');
  const url = String(formData.get('imageUrl') ?? '').trim();
  if (!/^https?:\/\//.test(url)) throw new Error('Bild-URL muss mit http(s):// beginnen');
  const store = getStore();
  const story = await store.getStory(id);
  if (!story) throw new Error('Story nicht gefunden');
  await store.updateStory(id, {
    image: {
      url,
      caption: String(formData.get('caption') ?? '').trim() || undefined,
      credit: String(formData.get('credit') ?? '').trim() || undefined,
      license: String(formData.get('license') ?? '').trim() || undefined,
      // Neue URL → neuer Upload beim nächsten WordPress-Push
      wpMediaId: story.image?.url === url ? story.image?.wpMediaId : undefined,
    },
    updatedAt: nowIso(),
  });
  await store.addAudit({
    id: newId('aud'), at: nowIso(), actor: ACTOR,
    action: 'story.image_set', storyId: id, detail: url,
  });
  revalidateAll();
}

/** Artikelbild entfernen. */
export async function removeImageAction(formData: FormData): Promise<void> {
  const id = String(formData.get('storyId') ?? '');
  const store = getStore();
  await store.updateStory(id, { image: undefined, updatedAt: nowIso() });
  await store.addAudit({
    id: newId('aud'), at: nowIso(), actor: ACTOR,
    action: 'story.image_removed', storyId: id,
  });
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

/** Breaking-News-Kennzeichnung umschalten (Frage 30). */
export async function toggleBreakingAction(formData: FormData): Promise<void> {
  const id = String(formData.get('storyId') ?? '');
  const store = getStore();
  const story = await store.getStory(id);
  if (!story) throw new Error('Story nicht gefunden');
  const breaking = !story.breaking;
  await store.updateStory(id, { breaking, updatedAt: nowIso() });
  await store.addAudit({
    id: newId('aud'), at: nowIso(), actor: ACTOR,
    action: breaking ? 'story.breaking_on' : 'story.breaking_off', storyId: id,
  });
  revalidateAll();
}

/**
 * Cluster-Korrektur: löst eine falsch zugeordnete Meldung aus der Story
 * und macht daraus eine eigene Story (Status "erkannt").
 */
export async function detachItemAction(formData: FormData): Promise<void> {
  const storyId = String(formData.get('storyId') ?? '');
  const itemId = String(formData.get('itemId') ?? '');
  const store = getStore();
  const story = await store.getStory(storyId);
  if (!story) throw new Error('Story nicht gefunden');
  if (!story.itemIds.includes(itemId)) throw new Error('Meldung gehört nicht zu dieser Story');
  if (story.itemIds.length < 2) {
    throw new Error('Letzte Meldung kann nicht gelöst werden – Story stattdessen archivieren');
  }
  const [item] = await store.listItemsByIds([itemId]);
  if (!item) throw new Error('Meldung nicht gefunden');

  await store.updateStory(storyId, {
    itemIds: story.itemIds.filter((id) => id !== itemId),
    updatedAt: nowIso(),
  });
  const newStoryId = newId('sty');
  const newStory: Story = {
    id: newStoryId,
    slug: slugify(item.title, newStoryId),
    workingTitle: item.title,
    category: story.category,
    region: story.region,
    status: 'detected',
    itemIds: [itemId],
    warnings: [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  await store.insertStory(newStory);
  await store.addAudit({
    id: newId('aud'), at: nowIso(), actor: ACTOR,
    action: 'story.detach_item', storyId,
    detail: `"${item.title}" → neue Story ${newStoryId}`,
  });
  revalidateAll();
}

/** Entwurf manuell bearbeiten (Review-Workflow, Frage 23/26). */
export async function updateDraftAction(formData: FormData): Promise<void> {
  const id = String(formData.get('storyId') ?? '');
  const store = getStore();
  const story = await store.getStory(id);
  if (!story?.draft) throw new Error('Story hat keinen Entwurf');
  const field = (name: string, fallback: string) =>
    String(formData.get(name) ?? fallback).trim() || fallback;
  const draft = {
    ...story.draft,
    headline: field('headline', story.draft.headline),
    subheadline: field('subheadline', story.draft.subheadline),
    summary: field('summary', story.draft.summary),
    body: field('body', story.draft.body),
    seoTitle: field('seoTitle', story.draft.seoTitle),
    metaDescription: field('metaDescription', story.draft.metaDescription),
    socialText: field('socialText', story.draft.socialText),
    tags: String(formData.get('tags') ?? '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    generator: story.draft.generator.endsWith('+admin')
      ? story.draft.generator
      : `${story.draft.generator}+admin`,
  };
  await store.updateStory(id, { draft, updatedAt: nowIso() });
  await store.addAudit({
    id: newId('aud'), at: nowIso(), actor: ACTOR,
    action: 'story.edit', storyId: id, detail: 'Entwurf manuell bearbeitet',
  });
  revalidateAll();
}

/**
 * "Neue Suche" (Frage 19): legt für einen Suchbegriff eine
 * Google-News-Suchquelle an und lässt das Radar sofort laufen –
 * so erschließt das System auf Wunsch neue Themen jenseits der
 * bekannten Feeds. Suchsprache wählbar (Deutsch oder Tamil).
 */
export async function newSearchAction(formData: FormData): Promise<void> {
  const term = String(formData.get('term') ?? '').trim();
  if (!term) throw new Error('Suchbegriff fehlt');
  const tamil = formData.get('searchLang') === 'ta';
  const params = tamil ? 'hl=ta&gl=IN&ceid=IN:ta' : 'hl=de&gl=DE&ceid=DE:de';
  const store = getStore();
  const source: Source = {
    id: newId('src'),
    name: `Google News Suche – ${term}${tamil ? ' (TA)' : ' (DE)'}`,
    homepage: 'https://news.google.com',
    feedUrl: `https://news.google.com/rss/search?q=${encodeURIComponent(term)}&${params}`,
    type: 'google-news',
    language: tamil ? 'ta' : 'de',
    region: tamil ? 'IN' : 'DACH',
    trustScore: 60,
    enabled: true,
    notes: 'Per „Neue Suche" angelegt – Treffer prüfen, ggf. sperren.',
  };
  await store.insertSource(source);
  await store.addAudit({
    id: newId('aud'), at: nowIso(), actor: ACTOR,
    action: 'source.search', detail: term,
  });
  await runRadar('manual');
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
