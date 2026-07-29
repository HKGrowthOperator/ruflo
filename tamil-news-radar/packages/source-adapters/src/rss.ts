import Parser from 'rss-parser';
import {
  type RawItem, type Source,
  newId, nowIso, sha1, stripHtml, truncate,
} from '@tnr/shared';

const parser = new Parser();

const FETCH_TIMEOUT_MS = 15_000;

/**
 * Holt einen RSS-/Google-News-Feed und normalisiert die Einträge.
 * Der Abruf läuft über globales fetch mit hartem Timeout (statt
 * rss-parser's eigenem HTTP-Client, der bei hängenden Verbindungen
 * blockieren kann); der Parser bekommt nur noch den XML-Text.
 * Google-News-Titel enthalten " - Quellenname" als Suffix – wird entfernt.
 */
export async function fetchRssSource(source: Source, maxItems: number): Promise<RawItem[]> {
  const response = await fetch(source.feedUrl, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: {
      'User-Agent': 'TamilNewsRadar/0.1 (+news aggregation; contact admin)',
      Accept: 'application/rss+xml, application/xml, text/xml, */*',
    },
    redirect: 'follow',
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} beim Abruf von ${source.feedUrl}`);
  }
  const xml = await response.text();
  const feed = await parser.parseString(xml);
  const fetchedAt = nowIso();
  const items: RawItem[] = [];

  for (const entry of (feed.items ?? []).slice(0, maxItems)) {
    const url = (entry.link ?? '').trim();
    let title = (entry.title ?? '').trim();
    if (!url || !title) continue;
    if (source.type === 'google-news') {
      title = title.replace(/\s+-\s+[^-]{2,60}$/, '').trim();
    }
    const summary = truncate(stripHtml(entry.contentSnippet ?? entry.content ?? ''), 600);
    const guid = (entry.guid ?? '').trim() || sha1(source.id + '|' + url);
    let publishedAt: string | undefined;
    if (entry.isoDate) publishedAt = entry.isoDate;
    else if (entry.pubDate) {
      const d = new Date(entry.pubDate);
      if (!Number.isNaN(d.getTime())) publishedAt = d.toISOString();
    }
    items.push({
      id: newId('itm'),
      sourceId: source.id,
      sourceName: source.name,
      guid,
      url,
      title,
      summary,
      publishedAt,
      fetchedAt,
      language: source.language,
    });
  }
  return items;
}
