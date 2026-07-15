import Link from 'next/link';
import { getStore } from '@tnr/database';
import {
  STATUS_LABELS, type RadarRunReport, type Story, type StoryStatus,
} from '@tnr/shared';
import { formatDate } from '../../lib/format';
import { runRadarAction } from './actions';

export const dynamic = 'force-dynamic';

const QUEUE_ORDER: StoryStatus[] = [
  'in_review', 'updated', 'changes_requested', 'approved',
  'drafted', 'detected', 'researching', 'scheduled', 'published',
];

/** Redaktionsübersicht: Radar-Status + Story-Warteschlangen. */
export default async function AdminPage() {
  const store = getStore();
  const [stories, audit] = await Promise.all([
    store.listStories({ limit: 300 }),
    store.listAudit(200),
  ]);

  const lastRun = audit.find((entry) => entry.action === 'radar.run');
  let report: RadarRunReport | null = null;
  if (lastRun?.detail) {
    try { report = JSON.parse(lastRun.detail) as RadarRunReport; } catch { /* alt */ }
  }

  const byStatus = new Map<StoryStatus, Story[]>();
  for (const story of stories) {
    const list = byStatus.get(story.status) ?? [];
    list.push(story);
    byStatus.set(story.status, list);
  }

  return (
    <>
      <h1>Redaktion</h1>

      <div className="card">
        <div className="actions">
          <form action={runRadarAction} className="inline">
            <button className="primary" type="submit">🔍 Radar jetzt laufen lassen</button>
          </form>
          <span className="meta">
            Automatisch alle 30 Minuten per Cron. Letzter Lauf:{' '}
            {report ? formatDate(report.finishedAt) : 'noch keiner'}
          </span>
        </div>
        {report && (
          <div className="meta">
            {report.sourcesOk}/{report.sourcesTotal} Quellen ok · {report.newItems} neue
            Meldungen · {report.newStories} neue Stories · {report.draftsCreated} Entwürfe
            erstellt
            {report.sourcesFailed.length > 0 && (
              <> · <strong style={{ color: 'var(--warn)' }}>
                {report.sourcesFailed.length} Quellen fehlerhaft (→ Quellen)
              </strong></>
            )}
          </div>
        )}
      </div>

      {QUEUE_ORDER.map((status) => {
        const list = byStatus.get(status);
        if (!list || list.length === 0) return null;
        return (
          <section key={status}>
            <h2>
              {STATUS_LABELS[status]} <span className="meta">({list.length})</span>
            </h2>
            <table>
              <thead>
                <tr>
                  <th>Story</th>
                  <th>Kategorie</th>
                  <th>Quellen</th>
                  <th>Aktualisiert</th>
                </tr>
              </thead>
              <tbody>
                {list.slice(0, 25).map((story) => (
                  <tr key={story.id}>
                    <td>
                      <Link href={`/admin/stories/${story.id}`}>
                        {story.draft?.headline ?? story.workingTitle}
                      </Link>
                      {story.warnings.length > 0 && ' ⚠️'}
                    </td>
                    <td><span className="badge">{story.category}</span></td>
                    <td>{story.itemIds.length}</td>
                    <td className="meta">{formatDate(story.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        );
      })}

      {stories.length === 0 && (
        <div className="notice">
          Noch keine Stories. „Radar jetzt laufen lassen" klicken, um die Quellen
          zum ersten Mal abzurufen.
        </div>
      )}
    </>
  );
}
