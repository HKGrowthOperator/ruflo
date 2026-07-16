/** Status-Lebenszyklus einer Story (siehe docs/architecture.md). */
export type StoryStatus =
  | 'detected'
  | 'researching'
  | 'drafted'
  | 'in_review'
  | 'changes_requested'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'updated'
  | 'archived';

export type SourceType = 'rss' | 'google-news';
export type Language = 'ta' | 'en' | 'si';
export type Region = 'IN' | 'LK' | 'INT';

export interface Source {
  id: string;
  name: string;
  homepage: string;
  feedUrl: string;
  type: SourceType;
  language: Language;
  region: Region;
  /** 0–100, vom Admin gewichtet */
  trustScore: number;
  enabled: boolean;
  notes?: string;
  lastFetchAt?: string;
  lastFetchStatus?: 'ok' | 'error';
  lastFetchError?: string;
  lastFetchItems?: number;
}

export interface RawItem {
  id: string;
  sourceId: string;
  sourceName: string;
  guid: string;
  url: string;
  title: string;
  summary: string;
  publishedAt?: string;
  fetchedAt: string;
  language: Language;
}

export interface DraftSourceRef {
  itemId: string;
  url: string;
  sourceName: string;
  title: string;
}

export interface ArticleDraft {
  headline: string;
  headlineVariants: string[];
  subheadline: string;
  summary: string;
  /** Markdown: Absätze, "## " für Zwischenüberschriften */
  body: string;
  tags: string[];
  seoTitle: string;
  metaDescription: string;
  socialText: string;
  language: 'ta';
  sources: DraftSourceRef[];
  /** Als unsicher markierte Aussagen (Frage 41) */
  uncertainNotes: string[];
  generatedAt: string;
  /** 'anthropic:<model>' oder 'mock' */
  generator: string;
  /** Token-Verbrauch des KI-Aufrufs (Kosten-Tracking, Frage 52) */
  usage?: { inputTokens: number; outputTokens: number };
}

export interface Story {
  id: string;
  slug: string;
  workingTitle: string;
  category: string;
  region?: Region;
  status: StoryStatus;
  itemIds: string[];
  draft?: ArticleDraft;
  warnings: string[];
  reviewNote?: string;
  publishedAt?: string;
  wordpressPostId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  action: string;
  storyId?: string;
  detail?: string;
}

export interface RadarSourceError {
  sourceId: string;
  name: string;
  error: string;
}

export interface RadarRunReport {
  startedAt: string;
  finishedAt: string;
  trigger: 'cron' | 'manual' | 'cli';
  sourcesTotal: number;
  sourcesOk: number;
  sourcesFailed: RadarSourceError[];
  newItems: number;
  newStories: number;
  updatedStories: number;
  draftsCreated: number;
}

export const CATEGORIES = [
  'தமிழ்நாடு',
  'இலங்கை',
  'இந்தியா',
  'உலகம்',
  'அரசியல்',
  'பொருளாதாரம்',
  'சினிமா',
  'விளையாட்டு',
  'தொழில்நுட்பம்',
] as const;

/** Kategorien mit strengerer Prüfung (Frage 39): 3 Quellen + Pflichthinweis */
export const SENSITIVE_CATEGORIES = ['அரசியல்', 'இலங்கை'] as const;

export const STATUS_LABELS: Record<StoryStatus, string> = {
  detected: 'Erkannt',
  researching: 'Wird recherchiert',
  drafted: 'Entwurf erstellt',
  in_review: 'Zur Prüfung',
  changes_requested: 'Änderungen angefordert',
  approved: 'Freigegeben',
  scheduled: 'Geplant',
  published: 'Veröffentlicht',
  updated: 'Aktualisiert',
  archived: 'Archiviert',
};
