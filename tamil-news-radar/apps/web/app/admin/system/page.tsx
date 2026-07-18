import Link from 'next/link';
import { formatDate } from '../../../lib/format';
import { estimateCostEur, getSystemStatus } from '../../../lib/system-status';

export const dynamic = 'force-dynamic';

/** Agentenstatus: Läufe, Quellen-Gesundheit, KI-Verbrauch – alles reale Daten. */
export default async function SystemPage() {
  const s = await getSystemStatus();

  return (
    <>
      <h1>Agentenstatus</h1>

      <div className="grid-2">
        <section className="card">
          <h2 style={{ marginTop: 0 }}>Agent</h2>
          <table>
            <tbody>
              <tr><td>Status</td><td>{s.lastRun ? '🟢 aktiv (Cron alle 30 Min)' : '⚪ noch kein Lauf'}</td></tr>
              <tr><td>Letzter Lauf</td><td className="num">{formatDate(s.lastRun?.finishedAt)}</td></tr>
              <tr><td>Nächster Lauf (erwartet)</td><td className="num">{formatDate(s.nextRunAt ?? undefined)}</td></tr>
              <tr><td>Auslöser zuletzt</td><td>{s.lastRun?.trigger ?? '–'}</td></tr>
              <tr><td>Aktive Quellen</td><td className="num">{s.enabledSources} / {s.totalSources}</td></tr>
              <tr><td>Quellen mit Fehler</td><td className="num">{s.sourceErrors.length}</td></tr>
            </tbody>
          </table>
        </section>

        <section className="card">
          <h2 style={{ marginTop: 0 }}>KI-Verbrauch</h2>
          <table>
            <tbody>
              <tr>
                <td>Provider</td>
                <td>{s.aiLive ? '🟢 Claude (live)' : '🟡 Mock – ANTHROPIC_API_KEY nicht gesetzt'}</td>
              </tr>
              <tr><td>Entwürfe mit Token-Daten</td><td className="num">{s.tokens.drafts}</td></tr>
              <tr><td>Input-Tokens gesamt</td><td className="num">{s.tokens.input.toLocaleString('de-DE')}</td></tr>
              <tr><td>Output-Tokens gesamt</td><td className="num">{s.tokens.output.toLocaleString('de-DE')}</td></tr>
              <tr>
                <td>Kosten (Schätzung, Sonnet-Klasse)</td>
                <td className="num">≈ {estimateCostEur(s.tokens).toLocaleString('de-DE')} €</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>

      <section>
        <h2>Laufhistorie <span className="meta">(letzte {s.runHistory.length})</span></h2>
        {s.runHistory.length === 0 ? (
          <div className="notice">Noch keine Radar-Läufe protokolliert.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Zeitpunkt</th><th>Auslöser</th><th className="num">Quellen ok</th>
                <th className="num">Neue Meldungen</th><th className="num">Verworfen</th>
                <th className="num">Neue Stories</th><th className="num">Entwürfe</th>
              </tr>
            </thead>
            <tbody>
              {s.runHistory.map((run, i) => (
                <tr key={i}>
                  <td className="meta num">{formatDate(run.finishedAt)}</td>
                  <td>{run.trigger}</td>
                  <td className="num">{run.sourcesOk}/{run.sourcesTotal}</td>
                  <td className="num">{run.newItems}</td>
                  <td className="num">{run.discardedItems ?? 0}</td>
                  <td className="num">{run.newStories}</td>
                  <td className="num">{run.draftsCreated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {s.sourceErrors.length > 0 && (
        <section>
          <h2>Fehlerhafte Quellen</h2>
          <table>
            <thead>
              <tr><th>Quelle</th><th>Fehler</th><th>Letzter Versuch</th></tr>
            </thead>
            <tbody>
              {s.sourceErrors.map((source) => (
                <tr key={source.id}>
                  <td><strong>{source.name}</strong></td>
                  <td className="meta">{source.lastFetchError}</td>
                  <td className="meta num">{formatDate(source.lastFetchAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="meta">
            Feed-URLs unter <Link href="/admin/quellen">Quellen</Link> korrigieren oder Quelle sperren.
          </p>
        </section>
      )}
    </>
  );
}
