import { getStore } from '@tnr/database';
import { formatDate } from '../../../lib/format';
import {
  addSourceAction, newSearchAction, toggleSourceAction, updateTrustAction,
} from '../actions';

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

      <h2>Neue Suche</h2>
      <form action={newSearchAction} className="card">
        <p className="meta">
          Startet eine Websuche zu einem Thema (Google News): legt eine
          Suchquelle an und lässt das Radar sofort laufen. Treffer erscheinen
          als Stories in der Redaktion.
        </p>
        <div className="grid-2">
          <label>Suchbegriff<input type="text" name="term" required /></label>
          <label>
            Suchsprache
            <select name="searchLang">
              <option value="de">Deutsch (DACH-Nachrichten)</option>
              <option value="ta">Tamil (Indien/Sri Lanka)</option>
            </select>
          </label>
        </div>
        <div className="actions">
          <button type="submit" className="primary">🔎 Suchen &amp; Radar starten</button>
        </div>
      </form>

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
              <option value="de">Deutsch</option>
              <option value="ta">Tamil</option>
              <option value="en">Englisch</option>
              <option value="si">Singhalesisch</option>
            </select>
          </label>
          <label>
            Region
            <select name="region">
              <option value="DACH">DACH</option>
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
