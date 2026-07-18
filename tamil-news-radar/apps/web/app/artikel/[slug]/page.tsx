import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getStore } from '@tnr/database';
import { formatDate, renderBody } from '../../../lib/format';
import { SITE_NAME, getSiteUrl } from '../../../lib/site';

export const dynamic = 'force-dynamic';

/** SEO-/OpenGraph-Metadaten aus den Entwurfsfeldern (Frage 28). */
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const story = await getStore().getStoryBySlug(decodeURIComponent(params.slug));
  if (!story?.draft || !['published', 'updated'].includes(story.status)) return {};
  const url = `${getSiteUrl()}/artikel/${encodeURIComponent(story.slug)}`;
  return {
    title: `${story.draft.seoTitle} | ${SITE_NAME}`,
    description: story.draft.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      siteName: SITE_NAME,
      title: story.draft.headline,
      description: story.draft.summary,
      publishedTime: story.publishedAt,
      tags: story.draft.tags,
    },
  };
}

/** Öffentliche Artikelseite mit Quellenblock (Frage 32). */
export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const store = getStore();
  const story = await store.getStoryBySlug(decodeURIComponent(params.slug));
  if (!story || !story.draft || !['published', 'updated'].includes(story.status)) {
    notFound();
  }
  const draft = story.draft;

  return (
    <article>
      {story.breaking && <><span className="badge breaking">🔴 EILMELDUNG</span>{' '}</>}
      <span className="badge">{story.category}</span>
      <h1>{draft.headline}</h1>
      {draft.subheadline && <p className="meta" style={{ fontSize: '1.05rem' }}>{draft.subheadline}</p>}
      <div className="meta">
        {formatDate(story.publishedAt)}
        {story.status === 'updated' ? ' · aktualisiert' : ''}
      </div>
      {draft.summary && <p><strong>{draft.summary}</strong></p>}
      <div className="article-body">{renderBody(draft.body)}</div>
      <section className="article-sources">
        <h2>Quellen</h2>
        <ul>
          {draft.sources.map((source) => (
            <li key={source.itemId}>
              <a href={source.url} rel="nofollow noopener" target="_blank">
                {source.sourceName}
              </a>
              : {source.title}
            </li>
          ))}
        </ul>
      </section>
      {draft.tags.length > 0 && (
        <p className="meta">
          {draft.tags.map((tag) => (
            <span className="badge" key={tag} style={{ marginRight: '0.4rem' }}>
              #{tag}
            </span>
          ))}
        </p>
      )}
    </article>
  );
}
