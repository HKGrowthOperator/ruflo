import Link from 'next/link';
import { getStore } from '@tnr/database';
import { formatDate } from '../lib/format';

export const dynamic = 'force-dynamic';

/** Öffentliche Startseite: veröffentlichte Artikel, neueste zuerst. */
export default async function HomePage() {
  const store = getStore();
  const stories = await store.listStories({ status: ['published', 'updated'], limit: 50 });

  return (
    <>
      <h1>சமீபத்திய செய்திகள்</h1>
      {stories.length === 0 && (
        <div className="notice">
          இன்னும் செய்திகள் வெளியிடப்படவில்லை. – Noch keine Artikel veröffentlicht.
          Artikel erscheinen hier, sobald sie im Admin-Dashboard freigegeben und
          veröffentlicht wurden.
        </div>
      )}
      {stories.map((story) => (
        <article className="card" key={story.id}>
          <span className="badge">{story.category}</span>
          <Link href={`/artikel/${encodeURIComponent(story.slug)}`}>
            <h3>{story.draft?.headline ?? story.workingTitle}</h3>
          </Link>
          {story.draft?.summary && <p>{story.draft.summary}</p>}
          <div className="meta">{formatDate(story.publishedAt)}</div>
        </article>
      ))}
    </>
  );
}
