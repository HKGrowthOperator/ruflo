import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { AuditEntry, RawItem, Source, Story } from '@tnr/shared';
import type { Store, StoryFilter } from './store';

/**
 * Supabase/Postgres-Store für den Produktivbetrieb.
 * Schema: supabase/migrations/0001_init.sql (snake_case-Spalten,
 * Draft als jsonb). Nutzt den Service-Role-Key, läuft daher nur
 * serverseitig.
 */
export class SupabaseStore implements Store {
  readonly kind = 'supabase' as const;
  private db: SupabaseClient;

  constructor(url: string, serviceRoleKey: string) {
    this.db = createClient(url, serviceRoleKey, { auth: { persistSession: false } });
  }

  async listSources(): Promise<Source[]> {
    const { data, error } = await this.db.from('sources').select('*').order('name');
    if (error) throw new Error(`sources: ${error.message}`);
    return (data ?? []).map(rowToSource);
  }

  async getSource(id: string): Promise<Source | null> {
    const { data, error } = await this.db.from('sources').select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(`source: ${error.message}`);
    return data ? rowToSource(data) : null;
  }

  async insertSource(source: Source): Promise<void> {
    const { error } = await this.db.from('sources').insert(sourceToRow(source));
    if (error) throw new Error(`insertSource: ${error.message}`);
  }

  async updateSource(id: string, patch: Partial<Source>): Promise<void> {
    const { error } = await this.db.from('sources').update(sourceToRow(patch)).eq('id', id);
    if (error) throw new Error(`updateSource: ${error.message}`);
  }

  async listItemsByIds(ids: string[]): Promise<RawItem[]> {
    if (ids.length === 0) return [];
    const { data, error } = await this.db.from('raw_items').select('*').in('id', ids);
    if (error) throw new Error(`items: ${error.message}`);
    return (data ?? []).map(rowToItem);
  }

  async existingItemKeys(): Promise<Set<string>> {
    const { data, error } = await this.db
      .from('raw_items')
      .select('guid,url')
      .order('fetched_at', { ascending: false })
      .limit(5000);
    if (error) throw new Error(`itemKeys: ${error.message}`);
    const keys = new Set<string>();
    for (const row of data ?? []) {
      keys.add(row.guid as string);
      keys.add(row.url as string);
    }
    return keys;
  }

  async insertItems(items: RawItem[]): Promise<void> {
    if (items.length === 0) return;
    const { error } = await this.db
      .from('raw_items')
      .upsert(items.map(itemToRow), { onConflict: 'guid', ignoreDuplicates: true });
    if (error) throw new Error(`insertItems: ${error.message}`);
  }

  async listStories(filter?: StoryFilter): Promise<Story[]> {
    let q = this.db.from('stories').select('*').order('updated_at', { ascending: false });
    if (filter?.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      q = q.in('status', statuses);
    }
    if (filter?.category) q = q.eq('category', filter.category);
    if (filter?.updatedSinceHours) {
      q = q.gte('updated_at', new Date(Date.now() - filter.updatedSinceHours * 3600_000).toISOString());
    }
    q = q.limit(filter?.limit ?? 200);
    const { data, error } = await q;
    if (error) throw new Error(`stories: ${error.message}`);
    return (data ?? []).map(rowToStory);
  }

  async getStory(id: string): Promise<Story | null> {
    const { data, error } = await this.db.from('stories').select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(`story: ${error.message}`);
    return data ? rowToStory(data) : null;
  }

  async getStoryBySlug(slug: string): Promise<Story | null> {
    const { data, error } = await this.db.from('stories').select('*').eq('slug', slug).maybeSingle();
    if (error) throw new Error(`storyBySlug: ${error.message}`);
    return data ? rowToStory(data) : null;
  }

  async insertStory(story: Story): Promise<void> {
    const { error } = await this.db.from('stories').insert(storyToRow(story));
    if (error) throw new Error(`insertStory: ${error.message}`);
  }

  async updateStory(id: string, patch: Partial<Story>): Promise<void> {
    const { error } = await this.db.from('stories').update(storyToRow(patch)).eq('id', id);
    if (error) throw new Error(`updateStory: ${error.message}`);
  }

  async addAudit(entry: AuditEntry): Promise<void> {
    const { error } = await this.db.from('audit_log').insert({
      id: entry.id, at: entry.at, actor: entry.actor,
      action: entry.action, story_id: entry.storyId ?? null, detail: entry.detail ?? null,
    });
    if (error) throw new Error(`addAudit: ${error.message}`);
  }

  async listAudit(limit = 100): Promise<AuditEntry[]> {
    const { data, error } = await this.db
      .from('audit_log').select('*').order('at', { ascending: false }).limit(limit);
    if (error) throw new Error(`audit: ${error.message}`);
    return (data ?? []).map((r) => ({
      id: r.id, at: r.at, actor: r.actor, action: r.action,
      storyId: r.story_id ?? undefined, detail: r.detail ?? undefined,
    }));
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToSource(r: any): Source {
  return {
    id: r.id, name: r.name, homepage: r.homepage, feedUrl: r.feed_url, type: r.type,
    language: r.language, region: r.region, trustScore: r.trust_score, enabled: r.enabled,
    notes: r.notes ?? undefined, lastFetchAt: r.last_fetch_at ?? undefined,
    lastFetchStatus: r.last_fetch_status ?? undefined, lastFetchError: r.last_fetch_error ?? undefined,
    lastFetchItems: r.last_fetch_items ?? undefined,
  };
}

function sourceToRow(s: Partial<Source>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (s.id !== undefined) row.id = s.id;
  if (s.name !== undefined) row.name = s.name;
  if (s.homepage !== undefined) row.homepage = s.homepage;
  if (s.feedUrl !== undefined) row.feed_url = s.feedUrl;
  if (s.type !== undefined) row.type = s.type;
  if (s.language !== undefined) row.language = s.language;
  if (s.region !== undefined) row.region = s.region;
  if (s.trustScore !== undefined) row.trust_score = s.trustScore;
  if (s.enabled !== undefined) row.enabled = s.enabled;
  if (s.notes !== undefined) row.notes = s.notes;
  if (s.lastFetchAt !== undefined) row.last_fetch_at = s.lastFetchAt;
  if (s.lastFetchStatus !== undefined) row.last_fetch_status = s.lastFetchStatus;
  if (s.lastFetchError !== undefined) row.last_fetch_error = s.lastFetchError;
  if (s.lastFetchItems !== undefined) row.last_fetch_items = s.lastFetchItems;
  return row;
}

function rowToItem(r: any): RawItem {
  return {
    id: r.id, sourceId: r.source_id, sourceName: r.source_name, guid: r.guid, url: r.url,
    title: r.title, summary: r.summary ?? '', publishedAt: r.published_at ?? undefined,
    fetchedAt: r.fetched_at, language: r.language,
  };
}

function itemToRow(i: RawItem): Record<string, unknown> {
  return {
    id: i.id, source_id: i.sourceId, source_name: i.sourceName, guid: i.guid, url: i.url,
    title: i.title, summary: i.summary, published_at: i.publishedAt ?? null,
    fetched_at: i.fetchedAt, language: i.language,
  };
}

function rowToStory(r: any): Story {
  return {
    id: r.id, slug: r.slug, workingTitle: r.working_title, category: r.category,
    region: r.region ?? undefined, status: r.status, itemIds: r.item_ids ?? [],
    draft: r.draft ?? undefined, warnings: r.warnings ?? [],
    reviewNote: r.review_note ?? undefined, publishedAt: r.published_at ?? undefined,
    wordpressPostId: r.wordpress_post_id ?? undefined,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

function storyToRow(s: Partial<Story>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (s.id !== undefined) row.id = s.id;
  if (s.slug !== undefined) row.slug = s.slug;
  if (s.workingTitle !== undefined) row.working_title = s.workingTitle;
  if (s.category !== undefined) row.category = s.category;
  if (s.region !== undefined) row.region = s.region;
  if (s.status !== undefined) row.status = s.status;
  if (s.itemIds !== undefined) row.item_ids = s.itemIds;
  if (s.draft !== undefined) row.draft = s.draft;
  if (s.warnings !== undefined) row.warnings = s.warnings;
  if (s.reviewNote !== undefined) row.review_note = s.reviewNote;
  if (s.publishedAt !== undefined) row.published_at = s.publishedAt;
  if (s.wordpressPostId !== undefined) row.wordpress_post_id = s.wordpressPostId;
  if (s.createdAt !== undefined) row.created_at = s.createdAt;
  if (s.updatedAt !== undefined) row.updated_at = s.updatedAt;
  return row;
}
