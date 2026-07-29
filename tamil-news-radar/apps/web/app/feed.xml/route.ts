import { getStore } from '@tnr/database';
import { SITE_NAME, escapeXml, getSiteUrl } from '../../lib/site';

export const dynamic = 'force-dynamic';

/** RSS-2.0-Feed der veröffentlichten Artikel (für Leser, WordPress-Import, Newsletter). */
export async function GET(): Promise<Response> {
  const store = getStore();
  const stories = await store.listStories({ status: ['published', 'updated'], limit: 50 });
  const site = getSiteUrl();

  const items = stories
    .filter((story) => story.draft)
    .map((story) => {
      const url = `${site}/artikel/${encodeURIComponent(story.slug)}`;
      return [
        '<item>',
        `<title>${escapeXml(story.draft!.headline)}</title>`,
        `<link>${escapeXml(url)}</link>`,
        `<guid isPermaLink="false">${escapeXml(story.id)}</guid>`,
        `<description>${escapeXml(story.draft!.summary)}</description>`,
        `<category>${escapeXml(story.category)}</category>`,
        story.publishedAt ? `<pubDate>${new Date(story.publishedAt).toUTCString()}</pubDate>` : '',
        '</item>',
      ].filter(Boolean).join('');
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>${escapeXml(SITE_NAME)}</title>
<link>${escapeXml(site)}</link>
<description>${escapeXml('Deutschsprachige Nachrichten für die tamilische Community im DACH-Raum')}</description>
<language>de</language>
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
