import Link from 'next/link';
import { STATUS_LABELS, type Story, type StoryStatus } from '@tnr/shared';
import { formatDate } from '../../lib/format';
import { getSystemStatus } from '../../lib/system-status';
import { runRadarAction } from './actions';

export const dynamic = 'force-dynamic';

/** Welche Aktion braucht die Redaktion bei diesem Status? */
const NEEDED_ACTION: Partial<Record<StoryStatus, string>> = {
  detected: 'Beobachten / Quellen abwarten',
  drafted: 'Entwurf prüfen',
  in_review: 'Freigeben oder Änderungen anfordern',
  changes_requested: 'Überarbeiten',
  approved: 'Veröffentlichen',
  updated: 'Update erneut freigeben',
};
const PRIORITY_ORDER: StoryStatus[] = [
  'in_review', 'updated', 'approved', 'changes_requested', 'drafted', 'detected',
];

function riskDot(risk?: Story['riskLevel']): string {
  return risk === 'red' ? '🔴' : risk === 'yellow' ? '🟡' : '🟢';
}

function StoryRow({ story }: { story: Story }) {
  return (
    <tr>
      <td>
        <Link href={`/admin/stories/${story.id}`}>
          {story.draft?.headline ?? story.workingTitle}
        </Link>
        {story.warnings.length > 0 && ' ⚠️'}
        {story.breaking && ' 🔴'}
      </td>
      <td><span className="badge">{story.category}</span></td>
      <td className="num">{story.relevanceScore ?? '–'}</td>
      <td>{riskDot(story.riskLevel)}</td>
      <td className="num">{story.itemIds.length}</td>
      <td className="meta">{NEEDED_ACTION[story.status] ?? STATUS_LABELS[story.status]}</td>
      <td className="meta">{formatDate(story.updatedAt)}</td>
    </tr>
  );
}

/** Redaktionsübersicht: Prioritäten, Agentenaktivität, Fehler & Blocker. */
export default async function AdminPage({
  searchParams,
}: {
  searchParams: { status?: string; risiko?: string; q?: string };
}) {
  const status = await getSystemStatus();

  const priorities = status.stories
    .filter((s) => PRIORITY_ORDER.slice(0, 5).includes(s.status))
    .sort(
      (a, b) =>
        PRIORITY_ORDER.indexOf(a.status) - PRIORITY_ORDER.indexOf(b.status) ||
        (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0)
    )
    .slice(0, 12);

  const blockers: Array<{ label: string; detail: string; href?: string }> = [
    ...status.sourceErrors.map((s) => ({
      label: `Quelle nicht erreichbar: ${s.name}`,
      detail: s.lastFetchError ?? '', href: '/admin/quellen',
    })),
    ...status.wpErrors.map((e) => ({
      label: 'WordPress-Push fehlgeschlagen',
      detail: e.detail ?? '', href: e.storyId ? `/admin/stories/${e.storyId}` : '/admin/wordpress',
    })),
    ...status.stories
      .filter((s) => s.riskLevel === 'red' && s.status !== 'archived')
      .map((s) => ({
        label: `Risikoklasse ROT: ${s.workingTitle}`,
        detail: 'Kein Auto-Entwurf – redaktionelle Recherche nötig.',
        href: `/admin/stories/${s.id}`,
      })),
  ];

  // Gefilterte Gesamtliste (Filterzustand in der URL)
  const filterStatus = searchParams.status as StoryStatus | undefined;
  const filterRisk = searchParams.risiko;
  const query = (searchParams.q ?? '').toLowerCase();
  const filtered = status.stories.filter(
    (s) =>
      (!filterStatus || s.status === filterStatus) &&
      (!filterRisk || (s.riskLevel ?? 'green') === filterRisk) &&
      (!query ||
        (s.draft?.headline ?? s.workingTitle).toLowerCase().includes(query))
  );

  return (
    <>
      <h1>Redaktion</h1>

      <div className="actions" style={{ marginTop: 0 }}>
        <form action={runRadarAction} className="inline">
          <button className="primary" type="submit">🔍 Radar jetzt laufen lassen</button>
        </form>
        {status.lastRun && (
          <span className="meta num">
            Letzter Lauf: {status.lastRun.sourcesOk}/{status.lastRun.sourcesTotal} Quellen ok ·{' '}
            {status.lastRun.newItems} neue Meldungen · {status.lastRun.discardedItems ?? 0} verworfen ·{' '}
            {status.lastRun.draftsCreated} Entwürfe
          </span>
        )}
      </div>

      {blockers.length > 0 && (
        <section>
          <h2>Fehler und Blocker <span className="meta">({blockers.length})</span></h2>
          {blockers.slice(0, 8).map((b, i) => (
            <div className="warning-box" key={i}>
              <strong>{b.label}</strong>
              {b.detail && <div className="meta">{b.detail}</div>}
              {b.href && <Link href={b.href}>→ öffnen</Link>}
            </div>
          ))}
        </section>
      )}

      <section>
        <h2>Redaktionelle Prioritäten <span className="meta">({priorities.length})</span></h2>
        {priorities.length === 0 && (
          <div className="notice">Nichts zu tun – Radar laufen lassen oder auf den Cron warten.</div>
        )}
        {priorities.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Story</th><th>Kategorie</th><th className="num">Score</th>
                <th>Risiko</th><th className="num">Quellen</th><th>Benötigte Aktion</th><th>Aktualisiert</th>
              </tr>
            </thead>
            <tbody>
              {priorities.map((s) => <StoryRow story={s} key={s.id} />)}
            </tbody>
          </table>
        )}
      </section>

      <div className="grid-2">
        <section>
          <h2>Agentenaktivität</h2>
          <div className="feed">
            {status.audit.slice(0, 14).map((entry) => (
              <div className="feed-item" key={entry.id}>
                <span className="t">{formatDate(entry.at)}</span>
                <span className="mono">{entry.action}</span>
                {entry.storyId && (
                  <> · <Link href={`/admin/stories/${entry.storyId}`}>Story</Link></>
                )}
                {entry.detail && entry.action !== 'radar.run' && (
                  <div className="meta">{entry.detail.slice(0, 110)}</div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2>Warteschlange</h2>
          <table>
            <tbody>
              {(Object.keys(STATUS_LABELS) as StoryStatus[])
                .filter((s) => status.queue[s])
                .map((s) => (
                  <tr key={s}>
                    <td><Link href={`/admin?status=${s}`}>{STATUS_LABELS[s]}</Link></td>
                    <td className="num">{status.queue[s]}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>
      </div>

      <section>
        <h2>Alle Stories <span className="meta">({filtered.length})</span></h2>
        <form method="get" className="actions" style={{ alignItems: 'end' }}>
          <label>Suche<input type="text" name="q" defaultValue={searchParams.q} /></label>
          <label>Status
            <select name="status" defaultValue={filterStatus ?? ''}>
              <option value="">alle</option>
              {(Object.keys(STATUS_LABELS) as StoryStatus[]).map((s) => (
                <option value={s} key={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </label>
          <label>Risiko
            <select name="risiko" defaultValue={filterRisk ?? ''}>
              <option value="">alle</option>
              <option value="green">grün</option>
              <option value="yellow">gelb</option>
              <option value="red">rot</option>
            </select>
          </label>
          <button type="submit">Filtern</button>
        </form>
        {filtered.length === 0 ? (
          <div className="notice">Keine Stories für diesen Filter.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Story</th><th>Kategorie</th><th className="num">Score</th>
                <th>Risiko</th><th className="num">Quellen</th><th>Status</th><th>Aktualisiert</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map((s) => (
                <tr key={s.id}>
                  <td>
                    <Link href={`/admin/stories/${s.id}`}>
                      {s.draft?.headline ?? s.workingTitle}
                    </Link>
                  </td>
                  <td><span className="badge">{s.category}</span></td>
                  <td className="num">{s.relevanceScore ?? '–'}</td>
                  <td>{riskDot(s.riskLevel)}</td>
                  <td className="num">{s.itemIds.length}</td>
                  <td><span className={`badge status-${s.status}`}>{STATUS_LABELS[s.status]}</span></td>
                  <td className="meta">{formatDate(s.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
