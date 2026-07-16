import type { MetadataRoute } from 'next';
import { getStore } from '@tnr/database';
import { getSiteUrl } from '../lib/site';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = getSiteUrl();
  const store = getStore();
  const stories = await store.listStories({ status: ['published', 'updated'], limit: 500 });

  return [
    { url: site, changeFrequency: 'hourly', priority: 1 },
    ...stories.map((story) => ({
      url: `${site}/artikel/${encodeURIComponent(story.slug)}`,
      lastModified: new Date(story.updatedAt),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
  ];
}
