import Link from 'next/link';
import { getStore } from '@tnr/database';
import { CATEGORIES, type Story } from '@tnr/shared';
import { formatDate } from '../lib/format';

export const dynamic = 'force-dynamic';

function StoryCard({ story, lead }: { story: Story; lead?: boolean }) {
  return (
    <article className={lead ? 'card lead' : 'card'}>
      {story.breaking && <><span className="badge breaking">🔴 EILMELDUNG</span>{' '}</>}
      <span className="badge">{story.category}</span>
      <Link href={`/artikel/${encodeURIComponent(story.slug)}`}>
        {story.image && (
          <div className="card-thumb">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={story.image.url} alt={story.image.caption ?? ''} />
          </div>
        )}
        <h3>{story.draft?.headline ?? story.workingTitle}</h3>
      </Link>
      {story.draft?.summary && <p>{story.draft.summary}</p>}
      <div className="meta">{formatDate(story.publishedAt)}</div>
    </article>
  );
}

/** Startseite: Eilmeldungen und Aufmacher zuerst, Rest im Raster. */
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
  const sorted = [...stories.filter((s) => s.breaking), ...stories.filter((s) => !s.breaking)];
  const [leadStory, ...rest] = sorted;

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

      {category && <h1>{category}</h1>}

      {sorted.length === 0 && (
        <div className="notice">
          Noch keine Artikel veröffentlicht. Artikel erscheinen hier, sobald sie
          im Admin-Dashboard freigegeben und veröffentlicht wurden.
        </div>
      )}

      {leadStory && <StoryCard story={leadStory} lead />}
      {rest.length > 0 && (
        <div className="story-grid">
          {rest.map((story) => (
            <StoryCard story={story} key={story.id} />
          ))}
        </div>
      )}
    </>
  );
}
