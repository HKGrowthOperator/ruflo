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
export type Language = 'ta' | 'en' | 'si' | 'de';
export type Region = 'IN' | 'LK' | 'INT' | 'DACH';

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

/** Stilmodi des Tamil.de-Redaktionsstandards (docs/styleguide.md) */
export type StyleMode =
  | 'NEWS_NEUTRAL'
  | 'COMMUNITY_SUCCESS'
  | 'CULTURE_IDENTITY'
  | 'ENTERTAINMENT'
  | 'EVENT_SERVICE';

export interface ArticleDraft {
  headline: string;
  headlineVariants: string[];
  subheadline: string;
  /** Dachzeile/Kicker, z. B. "Diaspora" oder "Kinostart" */
  kicker?: string;
  /** Gewählter Stilmodus */
  styleMode?: StyleMode;
  /** Explizit benannter Tamil-Bezug (Pflichtfrage der Redaktion) */
  tamilConnection?: string;
  /** Explizit benannter DACH-Bezug */
  dachConnection?: string;
  summary: string;
  /** Markdown: Absätze, "## " für Zwischenüberschriften */
  body: string;
  tags: string[];
  seoTitle: string;
  metaDescription: string;
  socialText: string;
  /** Publikationssprache: Deutsch (Tamil.de, DACH-Raum) */
  language: 'de';
  sources: DraftSourceRef[];
  /** Als unsicher markierte Aussagen (Frage 41) */
  uncertainNotes: string[];
  generatedAt: string;
  /** 'anthropic:<model>' oder 'mock' */
  generator: string;
  /** Token-Verbrauch des KI-Aufrufs (Kosten-Tracking, Frage 52) */
  usage?: { inputTokens: number; outputTokens: number };
}

/** Artikelbild (Fragen 44–47): Rechte müssen geklärt sein, bevor es gesetzt wird. */
export interface StoryImage {
  /** Öffentlich erreichbare Bild-URL (eigene Mediathek, Wikimedia, lizenzfrei …) */
  url: string;
  caption?: string;
  /** Urheber/Quelle, wird öffentlich angezeigt */
  credit?: string;
  /** Lizenzvermerk, z. B. "CC BY-SA 4.0" oder "eigenes Bild" */
  license?: string;
  /** Media-ID nach Upload in die WordPress-Mediathek */
  wpMediaId?: number;
}

export interface Story {
  id: string;
  slug: string;
  workingTitle: string;
  category: string;
  region?: Region;
  status: StoryStatus;
  /** Relevanzscore 0–100 (Redaktionsstandard Abschnitt 7) */
  relevanceScore?: number;
  /** Risikoklasse: green = automatisierbar, yellow = Pflichtfreigabe, red = kein Auto-Entwurf */
  riskLevel?: 'green' | 'yellow' | 'red';
  /** Breaking-News-Kennzeichnung (Frage 30), vom Admin gesetzt */
  breaking?: boolean;
  itemIds: string[];
  draft?: ArticleDraft;
  image?: StoryImage;
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
  /** Unter Relevanzschwelle automatisch verworfene Meldungen */
  discardedItems?: number;
  newStories: number;
  updatedStories: number;
  draftsCreated: number;
}

export const CATEGORIES = [
  'DACH & Diaspora',
  'Tamil Nadu',
  'Sri Lanka',
  'Politik',
  'Wirtschaft',
  'Kultur & Kino',
  'Sport',
] as const;

/** Kategorien mit strengerer Prüfung (Frage 39): 3 Quellen + Pflichthinweis */
export const SENSITIVE_CATEGORIES = ['Politik', 'Sri Lanka'] as const;

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
