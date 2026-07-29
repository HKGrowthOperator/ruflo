import type { RawItem, Source } from '@tnr/shared';
import { fetchRssSource } from './rss';

export { fetchRssSource } from './rss';

/**
 * Adapter-Dispatch: Quelle → normalisierte Meldungen.
 * V1 unterstützt 'rss' und 'google-news' (beides RSS-basiert);
 * weitere Typen (YouTube, X, …) bekommen hier eigene Adapter.
 */
export async function fetchSource(source: Source, maxItems: number): Promise<RawItem[]> {
  switch (source.type) {
    case 'rss':
    case 'google-news':
      return fetchRssSource(source, maxItems);
    default:
      throw new Error(`Kein Adapter für Quellentyp "${source.type as string}"`);
  }
}
