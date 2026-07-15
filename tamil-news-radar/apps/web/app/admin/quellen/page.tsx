import { getStore } from '@tnr/database';
import { formatDate } from '../../../lib/format';
import { addSourceAction, toggleSourceAction, updateTrustAction } from '../actions';

export const dynamic = 'force-dynamic';

/** Quellenverwaltung: Status, Gewichtung, Sperren, Hinzufügen (Frage 15). */
export default async function SourcesPage() {
  const store = getStore();
  const sources = await store.listSources();

  return (
    <>
      <h1>Quellen <span className="meta">({sources.length})</span></h1>
      <table>
        <thead>
          <tr>
            <th>Quelle</th>
            <th>Sprache/Region</th>
            <th>Letzter Abruf</th>
            <th>Vertrauen</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {sources.map((source) => (
            <tr key={source.id}>
              <td>
                <strong>{source.name}</strong>
                <div className="meta mono">{source.feedUrl}</div>
                {source.notes && <div className="meta">💡 {source.notes}</div>}
              </td>
              <td>{source.language.toUpperCase()} / {source.region}</td>
              <td className="meta">
                {formatDate(source.lastFetchAt)}
                {source.lastFetchStatus === 'ok' && <> · ✅ {source.lastFetchItems} Meldungen</>}
                {source.lastFetchStatus === 'error' && (
                  <div style={{ color: 'var(--warn)' }}>❌ {source.lastFetchError}</div>
                )}
              </td>
              <td>
                <form action={updateTrustAction} className="inline">
                  <input type="hidden" name="sourceId" value={source.id} />
                  <input
                    type="number" name="trustScore" defaultValue={source.trustScore}
                    min={0} max={100} style={{ width: '4.5rem' }}
                  />{' '}
                  <button type="submit">OK</button>
                </form>
              </td>
              <td>
                <form action={toggleSourceAction} className="inline">
                  <input type="hidden" name="sourceId" value={source.id} />
                  <input type="hidden" name="enabled" value={source.enabled ? 'false' : 'true'} />
                  <button type="submit">{source.enabled ? '🟢 aktiv → sperren' : '⚪ gesperrt → aktivieren'}</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Quelle hinzufügen</h2>
      <form action={addSourceAction} className="card">
        <div className="grid-2">
          <label>Name<input type="text" name="name" required /></label>
          <label>Feed-URL<input type="url" name="feedUrl" required /></label>
          <label>Homepage<input type="url" name="homepage" /></label>
          <label>
            Typ
            <select name="type">
              <option value="rss">RSS</option>
              <option value="google-news">Google News</option>
            </select>
          </label>
          <label>
            Sprache
            <select name="language">
              <option value="ta">Tamil</option>
              <option value="en">Englisch</option>
              <option value="si">Singhalesisch</option>
            </select>
          </label>
          <label>
            Region
            <select name="region">
              <option value="IN">Indien</option>
              <option value="LK">Sri Lanka</option>
              <option value="INT">International</option>
            </select>
          </label>
          <label>Vertrauen (0–100)<input type="number" name="trustScore" defaultValue={70} min={0} max={100} /></label>
        </div>
        <div className="actions">
          <button type="submit" className="primary">Quelle anlegen</button>
        </div>
      </form>
    </>
  );
}
