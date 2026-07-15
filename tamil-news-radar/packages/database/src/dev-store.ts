import fs from 'node:fs/promises';
import path from 'node:path';
import {
  type AuditEntry, type RawItem, type Source, type Story,
  SEED_SOURCES, getConfig, newId,
} from '@tnr/shared';
import { matchesFilter, type Store, type StoryFilter } from './store';

interface DevData {
  sources: Source[];
  items: RawItem[];
  stories: Story[];
  audit: AuditEntry[];
}

/**
 * Dateibasierter Store für die lokale Entwicklung (kein Postgres nötig).
 * Ablage: <dataDir>/db.json. Nicht für parallele Prozesse gedacht –
 * in Produktion Supabase konfigurieren.
 */
export class DevStore implements Store {
  readonly kind = 'dev' as const;
  private file: string;
  private data: DevData | null = null;

  constructor(dataDir = getConfig().dataDir) {
    this.file = path.join(dataDir, 'db.json');
  }

  private async load(): Promise<DevData> {
    if (this.data) return this.data;
    try {
      this.data = JSON.parse(await fs.readFile(this.file, 'utf8')) as DevData;
    } catch {
      this.data = {
        sources: SEED_SOURCES.map((s) => ({ ...s, id: newId('src') })),
        items: [],
        stories: [],
        audit: [],
      };
      await this.save();
    }
    return this.data;
  }

  private async save(): Promise<void> {
    await fs.mkdir(path.dirname(this.file), { recursive: true });
    const tmp = this.file + '.tmp';
    await fs.writeFile(tmp, JSON.stringify(this.data, null, 2), 'utf8');
    await fs.rename(tmp, this.file);
  }

  async listSources(): Promise<Source[]> {
    return [...(await this.load()).sources];
  }

  async getSource(id: string): Promise<Source | null> {
    return (await this.load()).sources.find((s) => s.id === id) ?? null;
  }

  async insertSource(source: Source): Promise<void> {
    (await this.load()).sources.push(source);
    await this.save();
  }

  async updateSource(id: string, patch: Partial<Source>): Promise<void> {
    const data = await this.load();
    const idx = data.sources.findIndex((s) => s.id === id);
    if (idx >= 0) {
      data.sources[idx] = { ...data.sources[idx], ...patch, id };
      await this.save();
    }
  }

  async listItemsByIds(ids: string[]): Promise<RawItem[]> {
    const set = new Set(ids);
    return (await this.load()).items.filter((i) => set.has(i.id));
  }

  async existingItemKeys(): Promise<Set<string>> {
    const keys = new Set<string>();
    for (const item of (await this.load()).items) {
      keys.add(item.guid);
      keys.add(item.url);
    }
    return keys;
  }

  async insertItems(items: RawItem[]): Promise<void> {
    if (items.length === 0) return;
    (await this.load()).items.push(...items);
    await this.save();
  }

  async listStories(filter?: StoryFilter): Promise<Story[]> {
    const stories = (await this.load()).stories
      .filter((s) => matchesFilter(s, filter))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return filter?.limit ? stories.slice(0, filter.limit) : stories;
  }

  async getStory(id: string): Promise<Story | null> {
    return (await this.load()).stories.find((s) => s.id === id) ?? null;
  }

  async getStoryBySlug(slug: string): Promise<Story | null> {
    return (await this.load()).stories.find((s) => s.slug === slug) ?? null;
  }

  async insertStory(story: Story): Promise<void> {
    (await this.load()).stories.push(story);
    await this.save();
  }

  async updateStory(id: string, patch: Partial<Story>): Promise<void> {
    const data = await this.load();
    const idx = data.stories.findIndex((s) => s.id === id);
    if (idx >= 0) {
      data.stories[idx] = { ...data.stories[idx], ...patch, id };
      await this.save();
    }
  }

  async addAudit(entry: AuditEntry): Promise<void> {
    (await this.load()).audit.push(entry);
    await this.save();
  }

  async listAudit(limit = 100): Promise<AuditEntry[]> {
    return (await this.load()).audit.slice(-limit).reverse();
  }
}
