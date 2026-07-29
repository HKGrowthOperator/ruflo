import { getAiProvider } from '@tnr/ai';
import { getStore, type Store } from '@tnr/database';
import { fetchSource } from '@tnr/source-adapters';
import {
  type RadarRunReport, type RadarSourceError, type RawItem, type Story,
  RELEVANCE_DISCARD_BELOW, RELEVANCE_WATCH_BELOW, SENSITIVE_CATEGORIES,
  classifyRisk, getConfig, newId, nowIso, scoreRelevance, slugify,
  tokenContainment,
} from '@tnr/shared';
import { buildCandidate, findMatchingStory, type ClusterCandidate } from './cluster';

/** Kategorie-Heuristik für neue Stories; der Admin kann sie ändern. */
function inferCategory(item: RawItem, region: string | undefined): string {
  if (region === 'DACH') return 'DACH & Diaspora';
  if (region === 'LK') return 'Sri Lanka';
  return 'Tamil Nadu';
}

function distinctSourceCount(items: RawItem[]): number {
  return new Set(items.map((i) => i.sourceId)).size;
}

function worseRisk(
  a: Story['riskLevel'],
  b: Story['riskLevel']
): Story['riskLevel'] {
  const order = { green: 0, yellow: 1, red: 2 } as const;
  return order[b ?? 'green'] > order[a ?? 'green'] ? b : (a ?? b);
}

function requiredSources(category: string): number {
  const config = getConfig();
  return (SENSITIVE_CATEGORIES as readonly string[]).includes(category)
    ? config.minSourcesSensitive
    : config.minSourcesForDraft;
}

/**
 * Ein kompletter Radar-Lauf (Frage 17/18): alle aktiven Quellen abrufen,
 * neue Meldungen deduplizieren, zu Stories clustern und – sobald genug
 * unabhängige Quellen vorliegen – automatisch einen Entwurf erstellen.
 * Läuft per Cron (alle 30 Min), per Admin-Button oder per CLI.
 */
export async function runRadar(trigger: RadarRunReport['trigger']): Promise<RadarRunReport> {
  const store = getStore();
  const config = getConfig();
  const startedAt = nowIso();
  const sources = (await store.listSources()).filter((s) => s.enabled);
  const failed: RadarSourceError[] = [];

  // 1) Alle Quellen parallel abrufen, Abrufstatus je Quelle festhalten
  const results = await Promise.allSettled(
    sources.map((s) => fetchSource(s, config.maxItemsPerSource))
  );
  const fetchedItems: RawItem[] = [];
  for (let i = 0; i < sources.length; i++) {
    const source = sources[i];
    const result = results[i];
    if (result.status === 'fulfilled') {
      fetchedItems.push(...result.value);
      await store.updateSource(source.id, {
        lastFetchAt: nowIso(), lastFetchStatus: 'ok',
        lastFetchError: undefined, lastFetchItems: result.value.length,
      });
    } else {
      const message = result.reason instanceof Error ? result.reason.message : String(result.reason);
      failed.push({ sourceId: source.id, name: source.name, error: message });
      await store.updateSource(source.id, {
        lastFetchAt: nowIso(), lastFetchStatus: 'error', lastFetchError: message.slice(0, 300),
      });
    }
  }

  // 2) Dedupe gegen bereits bekannte Meldungen (guid + url)
  const known = await store.existingItemKeys();
  const seenThisRun = new Set<string>();
  const newItems = fetchedItems.filter((item) => {
    if (known.has(item.guid) || known.has(item.url)) return false;
    if (seenThisRun.has(item.guid) || seenThisRun.has(item.url)) return false;
    seenThisRun.add(item.guid);
    seenThisRun.add(item.url);
    return true;
  });

  // 3) Clustering gegen aktive Stories im Zeitfenster
  const recentStories = await store.listStories({ updatedSinceHours: config.clusterWindowHours });
  const clusterable = recentStories.filter((s) => s.status !== 'archived');
  const candidates: ClusterCandidate[] = [];
  for (const story of clusterable) {
    const items = await store.listItemsByIds(story.itemIds);
    candidates.push(buildCandidate(story, items.map((i) => i.title)));
  }

  const sourceById = new Map(sources.map((s) => [s.id, s]));
  let newStories = 0;
  let discardedItems = 0;
  const touchedStoryIds = new Set<string>();
  const keptItems: RawItem[] = [];

  for (const item of newItems) {
    const source = sourceById.get(item.sourceId);
    const itemText = `${item.title} ${item.summary}`;
    const match = findMatchingStory(item, candidates, config.similarityThreshold);

    if (match) {
      // Zu bestehender Story: Item zählt immer (bestätigt das Ereignis)
      keptItems.push(item);
      match.itemIds = [...match.itemIds, item.id];
      const risk = worseRisk(match.riskLevel, classifyRisk(itemText));
      await store.updateStory(match.id, {
        itemIds: match.itemIds, riskLevel: risk, updatedAt: nowIso(),
      });
      match.riskLevel = risk;
      touchedStoryIds.add(match.id);
      continue;
    }

    // Neue Story: Relevanz bewerten (Redaktionsstandard Abschnitt 7)
    const relevance = scoreRelevance({
      text: itemText,
      publishedAt: item.publishedAt,
      sourceTrust: source?.trustScore,
      sourceRegionDach: source?.region === 'DACH',
      sourceLanguageTamil: source?.language === 'ta',
    });
    if (relevance.total < RELEVANCE_DISCARD_BELOW) {
      discardedItems++;
      continue;
    }
    keptItems.push(item);

    const risk = classifyRisk(itemText);
    const warnings: string[] = [];
    if (relevance.total < RELEVANCE_WATCH_BELOW) {
      warnings.push(`Relevanz niedrig (${relevance.total}/100) – nur beobachten oder Kurzmeldung.`);
    }
    if (risk === 'red') {
      warnings.push('Risikoklasse ROT – kein automatischer Entwurf, redaktionelle Recherche nötig.');
    }

    const id = newId('sty');
    const story: Story = {
      id,
      slug: slugify(item.title, id),
      workingTitle: item.title,
      category: inferCategory(item, source?.region),
      region: source?.region,
      status: 'detected',
      relevanceScore: relevance.total,
      riskLevel: risk,
      itemIds: [item.id],
      warnings,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    await store.insertStory(story);
    candidates.push(buildCandidate(story, [item.title]));
    touchedStoryIds.add(id);
    newStories++;
  }
  await store.insertItems(keptItems);

  // 4) Entwürfe für Stories mit genug unabhängigen Quellen.
  //    Risikoklasse ROT bekommt nie einen automatischen Entwurf.
  let draftsCreated = 0;
  for (const storyId of touchedStoryIds) {
    const story = await store.getStory(storyId);
    if (!story || story.draft || !['detected', 'researching'].includes(story.status)) continue;
    if (story.riskLevel === 'red') continue;
    const items = await store.listItemsByIds(story.itemIds);
    if (distinctSourceCount(items) >= requiredSources(story.category)) {
      await draftStory(store, story, items, 'radar');
      draftsCreated++;
    }
  }

  const report: RadarRunReport = {
    startedAt,
    finishedAt: nowIso(),
    trigger,
    sourcesTotal: sources.length,
    sourcesOk: sources.length - failed.length,
    sourcesFailed: failed,
    newItems: keptItems.length,
    discardedItems,
    newStories,
    updatedStories: touchedStoryIds.size - newStories,
    draftsCreated,
  };
  await store.addAudit({
    id: newId('aud'), at: nowIso(), actor: trigger === 'manual' ? 'admin' : 'system',
    action: 'radar.run', detail: JSON.stringify(report),
  });
  return report;
}

/** Entwurf für eine Story erzeugen (auto oder per Admin-Button). */
export async function draftStory(
  store: Store,
  story: Story,
  items: RawItem[],
  actor: string
): Promise<void> {
  const ai = getAiProvider();
  const wasPublished = ['published', 'updated'].includes(story.status);
  const draft = await ai.generateDraft({ story, items, previousDraft: story.draft });

  const warnings: string[] = [];
  const distinct = distinctSourceCount(items);
  if (distinct < 2) warnings.push('Nur eine unabhängige Quelle – Einzelquelle kennzeichnen.');
  if ((SENSITIVE_CATEGORIES as readonly string[]).includes(story.category)) {
    warnings.push('Sensible Kategorie – Pflichtprüfung vor Freigabe (mind. 3 Quellen).');
  }
  if (story.riskLevel === 'yellow') {
    warnings.push('Risikoklasse GELB (Politik/Konflikt/Personen) – menschliche Freigabe zwingend, Fakten einzeln prüfen.');
  }
  if (draft.uncertainNotes.length > 0) {
    warnings.push(`${draft.uncertainNotes.length} unsichere Aussage(n) im Entwurf markiert.`);
  }
  if (wasPublished) warnings.push('Update nach Veröffentlichung – erneute Freigabe nötig.');

  // Ähnlichkeitsprüfung (Frage 43): Entwurf zu nah am Quelltext?
  for (const item of items) {
    if (item.summary.length < 60) continue;
    const containment = tokenContainment(item.summary, draft.body);
    if (containment >= 0.8) {
      warnings.push(
        `Hohe Textähnlichkeit zur Quelle "${item.sourceName}" (${Math.round(containment * 100)} %) – vor Freigabe umformulieren.`
      );
    }
  }

  await store.updateStory(story.id, {
    draft,
    warnings,
    status: wasPublished ? 'updated' : 'drafted',
    updatedAt: nowIso(),
  });
  await store.addAudit({
    id: newId('aud'), at: nowIso(), actor,
    action: story.draft ? 'story.redraft' : 'story.draft',
    storyId: story.id,
    detail:
      `Generator: ${draft.generator}, Quellen: ${distinct}` +
      (draft.usage ? `, Tokens: ${draft.usage.inputTokens} in / ${draft.usage.outputTokens} out` : ''),
  });
}

/**
 * "Aktualisieren"-Button (Frage 19/21): kompletter Quellen-Abruf, dann
 * Entwurf dieser Story mit allen (auch neu zugeordneten) Meldungen neu
 * erstellen. Bei bereits veröffentlichten Stories entsteht ein
 * Update-Entwurf, der erneut durch die Freigabe muss.
 */
export async function refreshStory(storyId: string, actor: string): Promise<RadarRunReport> {
  const store = getStore();
  const report = await runRadar('manual');
  const story = await store.getStory(storyId);
  if (!story) throw new Error('Story nicht gefunden');
  const items = await store.listItemsByIds(story.itemIds);
  if (items.length === 0) throw new Error('Story hat keine Quellenmeldungen');
  await draftStory(store, story, items, actor);
  return report;
}
