import Link from 'next/link';
import { getStore } from '@tnr/database';
import { CATEGORIES } from '@tnr/shared';
import { formatDate } from '../lib/format';

export const dynamic = 'force-dynamic';

/** Öffentliche Startseite: Eilmeldungen zuerst, Kategorie-Filter, neueste zuerst. */
export default async function HomePage({
  searchParams,
}: {
  searchParams: { kategorie?: string };
}) {
  const store = getStore();
  const category = searchParams.kategorie;
  const stories = await store.listStories({
    status: ['published', 'updated'],
    category: category || undefined,
    limit: 50,
  });
  const breaking = stories.filter((s) => s.breaking);
  const regular = stories.filter((s) => !s.breaking);

  return (
    <>
      <nav className="category-nav">
        <Link href="/" className={!category ? 'active' : ''}>Alle Themen</Link>
        {CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={`/?kategorie=${encodeURIComponent(cat)}`}
            className={category === cat ? 'active' : ''}
          >
            {cat}
          </Link>
        ))}
      </nav>

      <h1>{category ?? 'Aktuelle Nachrichten'}</h1>

      {stories.length === 0 && (
        <div className="notice">
          Noch keine Artikel veröffentlicht. Artikel erscheinen hier, sobald sie
          im Admin-Dashboard freigegeben und veröffentlicht wurden.
        </div>
      )}

      {[...breaking, ...regular].map((story) => (
        <article className="card" key={story.id}>
          {story.breaking && <span className="badge breaking">🔴 EILMELDUNG</span>}{' '}
          <span className="badge">{story.category}</span>
          <Link href={`/artikel/${encodeURIComponent(story.slug)}`}>
            <h3>{story.draft?.headline ?? story.workingTitle}</h3>
          </Link>
          {story.draft?.summary && <p>{story.draft.summary}</p>}
          <div className="meta">{formatDate(story.publishedAt)}</div>
        </article>
      ))}

      <p className="meta">
        <a href="/feed.xml">RSS-Feed</a>
      </p>
    </>
  );
}
