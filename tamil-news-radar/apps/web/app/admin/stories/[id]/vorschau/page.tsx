import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getStore } from '@tnr/database';
import { STATUS_LABELS } from '@tnr/shared';
import { formatDate, renderBody } from '../../../../../lib/format';

export const dynamic = 'force-dynamic';

/**
 * Vorschau (Frage 27): zeigt den Entwurf exakt im Layout der
 * öffentlichen Artikelseite – unabhängig vom Status, vor der Freigabe.
 */
export default async function StoryPreviewPage({ params }: { params: { id: string } }) {
  const store = getStore();
  const story = await store.getStory(params.id);
  if (!story?.draft) notFound();
  const draft = story.draft;

  return (
    <>
      <div className="warning-box">
        👁️ <strong>Vorschau</strong> – Status: {STATUS_LABELS[story.status]}. So wird der
        Artikel auf der Website aussehen.{' '}
        <Link href={`/admin/stories/${story.id}`}>← Zurück zur Story</Link>
      </div>
      <article>
        <span className="badge">{story.category}</span>
        <h1>{draft.headline}</h1>
        {draft.subheadline && (
          <p className="meta" style={{ fontSize: '1.05rem' }}>{draft.subheadline}</p>
        )}
        <div className="meta">{formatDate(story.publishedAt ?? story.updatedAt)}</div>
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
    </>
  );
}
