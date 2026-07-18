import Link from 'next/link';
import { getStore } from '@tnr/database';
import { isAutoPushEnabled, testWordPressConnection } from '@tnr/editorial';
import { formatDate } from '../../../lib/format';

export const dynamic = 'force-dynamic';

/**
 * WordPress-Bereich: echter Verbindungstest (users/me + Kategorien via
 * REST API) und alle verknüpften Beiträge. Nichts hier ist simuliert –
 * ohne Konfiguration wird der Einrichtungsweg gezeigt.
 */
export default async function WordPressPage() {
  const [connection, stories] = await Promise.all([
    testWordPressConnection(),
    getStore().listStories({ limit: 300 }),
  ]);
  const linked = stories.filter((s) => typeof s.wordpressPostId === 'number');

  return (
    <>
      <h1>WordPress</h1>

      <section className="card">
        <h2 style={{ marginTop: 0 }}>Verbindung (Live-Test)</h2>
        {!connection.configured && (
          <div className="notice">
            <strong>Nicht konfiguriert.</strong> In der Umgebung setzen:{' '}
            <span className="mono">WORDPRESS_URL</span>,{' '}
            <span className="mono">WORDPRESS_USER</span>,{' '}
            <span className="mono">WORDPRESS_APP_PASSWORD</span>{' '}
            (WordPress → Benutzer → Profil → Anwendungspasswörter).
            Danach zeigt diese Seite den echten Verbindungsstatus, den
            angemeldeten Benutzer und die Kategorien von Tamil.de.
          </div>
        )}
        {connection.configured && connection.ok && (
          <>
            <div className="notice">
              🟢 <strong>Verbunden</strong> als „{connection.user}" ·
              Auto-Push beim Veröffentlichen: {isAutoPushEnabled() ? 'aktiv' : 'aus'} ·
              Beiträge landen als <span className="mono">
                {process.env.WORDPRESS_PUBLISH_STATUS === 'publish' ? 'publish' : 'draft (pending review)'}
              </span>
            </div>
            {connection.categories && connection.categories.length > 0 && (
              <>
                <h3>Kategorien auf Tamil.de</h3>
                <p className="meta">
                  {connection.categories.map((c) => `${c.name} (${c.count})`).join(' · ')}
                </p>
              </>
            )}
          </>
        )}
        {connection.configured && !connection.ok && (
          <div className="warning-box">
            <strong>❌ Verbindung fehlgeschlagen:</strong> {connection.error}
          </div>
        )}
      </section>

      <section>
        <h2>Verknüpfte Beiträge <span className="meta">({linked.length})</span></h2>
        {linked.length === 0 ? (
          <div className="notice">
            Noch keine Beiträge nach WordPress übertragen. Beim Veröffentlichen
            einer Story wird automatisch ein Beitrag angelegt (inkl. Beitragsbild).
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Story</th><th className="num">WordPress-ID</th>
                <th className="num">Bild-Media-ID</th><th>Zuletzt übertragen</th>
              </tr>
            </thead>
            <tbody>
              {linked.map((story) => (
                <tr key={story.id}>
                  <td>
                    <Link href={`/admin/stories/${story.id}`}>
                      {story.draft?.headline ?? story.workingTitle}
                    </Link>
                  </td>
                  <td className="num">#{story.wordpressPostId}</td>
                  <td className="num">{story.image?.wpMediaId ? `#${story.image.wpMediaId}` : '–'}</td>
                  <td className="meta num">{formatDate(story.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
