import type { AuditEntry, RawItem, Source, Story, StoryStatus } from '@tnr/shared';

export interface StoryFilter {
  status?: StoryStatus | StoryStatus[];
  category?: string;
  updatedSinceHours?: number;
  limit?: number;
}

/** Persistenz-Abstraktion: DevStore (JSON) oder SupabaseStore. */
export interface Store {
  readonly kind: 'dev' | 'supabase';

  // Quellen
  listSources(): Promise<Source[]>;
  getSource(id: string): Promise<Source | null>;
  insertSource(source: Source): Promise<void>;
  updateSource(id: string, patch: Partial<Source>): Promise<void>;

  // Roh-Meldungen
  listItemsByIds(ids: string[]): Promise<RawItem[]>;
  /** Bereits bekannte guid/url-Schlüssel, für Dedupe */
  existingItemKeys(): Promise<Set<string>>;
  insertItems(items: RawItem[]): Promise<void>;

  // Stories
  listStories(filter?: StoryFilter): Promise<Story[]>;
  getStory(id: string): Promise<Story | null>;
  getStoryBySlug(slug: string): Promise<Story | null>;
  insertStory(story: Story): Promise<void>;
  updateStory(id: string, patch: Partial<Story>): Promise<void>;

  // Audit-Log
  addAudit(entry: AuditEntry): Promise<void>;
  listAudit(limit?: number): Promise<AuditEntry[]>;
}

export function matchesFilter(story: Story, filter?: StoryFilter): boolean {
  if (!filter) return true;
  if (filter.status) {
    const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
    if (!statuses.includes(story.status)) return false;
  }
  if (filter.category && story.category !== filter.category) return false;
  if (filter.updatedSinceHours) {
    const cutoff = Date.now() - filter.updatedSinceHours * 3600_000;
    if (new Date(story.updatedAt).getTime() < cutoff) return false;
  }
  return true;
}
