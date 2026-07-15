import { notFound } from 'next/navigation';
import { getStore } from '@tnr/database';
import { formatDate, renderBody } from '../../../lib/format';

export const dynamic = 'force-dynamic';

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
      <span className="badge">{story.category}</span>
      <h1>{draft.headline}</h1>
      {draft.subheadline && <p className="meta" style={{ fontSize: '1.05rem' }}>{draft.subheadline}</p>}
      <div className="meta">
        {formatDate(story.publishedAt)}
        {story.status === 'updated' ? ' · புதுப்பிக்கப்பட்டது (aktualisiert)' : ''}
      </div>
      {draft.summary && <p><strong>{draft.summary}</strong></p>}
      <div className="article-body">{renderBody(draft.body)}</div>
      <section className="article-sources">
        <h2>ஆதாரங்கள் (Quellen)</h2>
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
