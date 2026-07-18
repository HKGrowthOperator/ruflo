import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getStore } from '@tnr/database';
import { canTransition, getWordPressConfig } from '@tnr/editorial';
import { STATUS_LABELS } from '@tnr/shared';
import { formatDate, renderBody } from '../../../../lib/format';
import {
  detachItemAction, draftStoryAction, pushWordPressAction, refreshStoryAction,
  removeImageAction, setImageAction, toggleBreakingAction, transitionStoryAction,
  updateDraftAction,
} from '../../actions';

export const dynamic = 'force-dynamic';

/** Story-Detail: Prüfen, Freigeben, Veröffentlichen, Aktualisieren. */
export default async function StoryDetailPage({ params }: { params: { id: string } }) {
  const store = getStore();
  const story = await store.getStory(params.id);
  if (!story) notFound();
  const items = await store.listItemsByIds(story.itemIds);
  const wordpressConfigured = getWordPressConfig() !== null;

  const transitionButtons: Array<{ action: string; label: string; className?: string }> = [
    { action: 'submit_review', label: 'Zur Prüfung geben' },
    { action: 'request_changes', label: 'Änderungen anfordern' },
    { action: 'approve', label: 'Freigeben', className: 'ok' },
    { action: 'unapprove', label: 'Freigabe zurückziehen' },
    { action: 'publish', label: '📢 Veröffentlichen', className: 'primary' },
    { action: 'archive', label: 'Archivieren' },
    { action: 'unarchive', label: 'Wiederherstellen' },
  ];

  return (
    <>
      <p><Link href="/admin">← Zurück zur Redaktion</Link></p>
      <span className={`badge status-${story.status}`}>{STATUS_LABELS[story.status]}</span>{' '}
      <span className="badge">{story.category}</span>
      {story.riskLevel && (
        <> <span className={`badge risk-${story.riskLevel}`}>
          {story.riskLevel === 'green' ? '🟢 Grün' : story.riskLevel === 'yellow' ? '🟡 Gelb – Pflichtfreigabe' : '🔴 Rot – manuelle Recherche'}
        </span></>
      )}
      {typeof story.relevanceScore === 'number' && (
        <> <span className="badge">Relevanz {story.relevanceScore}/100</span></>
      )}
      {story.breaking && <> <span className="badge breaking">🔴 EILMELDUNG</span></>}
      <h1>{story.draft?.headline ?? story.workingTitle}</h1>
      <div className="meta">
        Erkannt: {formatDate(story.createdAt)} · Aktualisiert: {formatDate(story.updatedAt)}
        {story.publishedAt && <> · Veröffentlicht: {formatDate(story.publishedAt)}</>}
        {story.wordpressPostId && <> · WordPress-Post #{story.wordpressPostId}</>}
      </div>

      {story.warnings.length > 0 && (
        <div className="warning-box">
          <strong>⚠️ Hinweise zur Prüfung:</strong>
          <ul>{story.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>
        </div>
      )}
      {story.reviewNote && (
        <div className="notice"><strong>Anmerkung:</strong> {story.reviewNote}</div>
      )}

      <div className="actions">
        {story.draft && (
          <Link className="btn" href={`/admin/stories/${story.id}/vorschau`}>
            👁️ Vorschau (wie auf der Website)
          </Link>
        )}
        <form action={refreshStoryAction} className="inline">
          <input type="hidden" name="storyId" value={story.id} />
          <button type="submit">🔄 Aktualisieren (Quellen neu abrufen + Entwurf neu)</button>
        </form>
        {items.length > 0 && (
          <form action={draftStoryAction} className="inline">
            <input type="hidden" name="storyId" value={story.id} />
            <button type="submit">
              {story.draft ? '✍️ Entwurf neu erstellen' : '✍️ Entwurf erstellen'}
            </button>
          </form>
        )}
        <form action={toggleBreakingAction} className="inline">
          <input type="hidden" name="storyId" value={story.id} />
          <button type="submit">
            {story.breaking ? '⚪ Breaking entfernen' : '🔴 Als Breaking markieren'}
          </button>
        </form>
        {transitionButtons
          .filter((b) => canTransition(story, b.action as never))
          .map((b) => (
            <form action={transitionStoryAction} className="inline" key={b.action}>
              <input type="hidden" name="storyId" value={story.id} />
              <input type="hidden" name="action" value={b.action} />
              <button type="submit" className={b.className}>{b.label}</button>
            </form>
          ))}
        {wordpressConfigured && story.draft &&
          ['approved', 'published', 'updated'].includes(story.status) && (
            <form action={pushWordPressAction} className="inline">
              <input type="hidden" name="storyId" value={story.id} />
              <button type="submit">
                {story.wordpressPostId ? '↻ WordPress aktualisieren' : '→ Nach WordPress pushen'}
              </button>
            </form>
          )}
      </div>

      {canTransition(story, 'request_changes') && (
        <form action={transitionStoryAction} className="card">
          <input type="hidden" name="storyId" value={story.id} />
          <input type="hidden" name="action" value="request_changes" />
          <label>
            Änderungswunsch (geht mit „Änderungen anfordern" in die Story):
            <textarea name="note" rows={2} />
          </label>
          <div className="actions">
            <button type="submit">Änderungen anfordern (mit Anmerkung)</button>
          </div>
        </form>
      )}

      <section className="card">
        <h2 style={{ marginTop: 0 }}>🖼️ Artikelbild</h2>
        {story.image && (
          <figure style={{ margin: '0 0 0.75rem' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={story.image.url}
              alt={story.image.caption ?? ''}
              style={{ maxWidth: '100%', maxHeight: '260px', borderRadius: '8px' }}
            />
            <figcaption className="meta">
              {story.image.caption}
              {story.image.credit && <> · Bild: {story.image.credit}</>}
              {story.image.license && <> · Lizenz: {story.image.license}</>}
              {story.image.wpMediaId && <> · WordPress-Media #{story.image.wpMediaId}</>}
            </figcaption>
          </figure>
        )}
        <form action={setImageAction}>
          <input type="hidden" name="storyId" value={story.id} />
          <div className="grid-2">
            <label>Bild-URL (Rechte müssen geklärt sein!)
              <input type="url" name="imageUrl" defaultValue={story.image?.url} required />
            </label>
            <label>Bildunterschrift
              <input type="text" name="caption" defaultValue={story.image?.caption} />
            </label>
            <label>Credit / Urheber
              <input type="text" name="credit" defaultValue={story.image?.credit} />
            </label>
            <label>Lizenz
              <input type="text" name="license" defaultValue={story.image?.license} placeholder="z. B. CC BY-SA 4.0, eigenes Bild" />
            </label>
          </div>
          <div className="actions">
            <button type="submit">{story.image ? 'Bild aktualisieren' : 'Bild setzen'}</button>
          </div>
        </form>
        {story.image && (
          <form action={removeImageAction} className="inline">
            <input type="hidden" name="storyId" value={story.id} />
            <button type="submit">Bild entfernen</button>
          </form>
        )}
        <p className="meta">
          Beim Veröffentlichen wird das Bild automatisch in die
          WordPress-Mediathek hochgeladen und als Beitragsbild gesetzt.
          KI-Retusche/Zuschnitt ist als nächste Ausbaustufe vorgesehen.
        </p>
      </section>

      <div className="grid-2">
        <section>
          <h2>Entwurf {story.draft && <span className="meta">({story.draft.generator})</span>}</h2>
          {!story.draft && (
            <div className="notice">
              Noch kein Entwurf. Er wird automatisch erstellt, sobald genug unabhängige
              Quellen vorliegen – oder oben manuell anstoßen.
            </div>
          )}
          {story.draft && (
            <div className="card">
              {(story.draft.kicker || story.draft.styleMode) && (
                <div className="meta">
                  {story.draft.kicker && <span className="badge">{story.draft.kicker}</span>}{' '}
                  {story.draft.styleMode && <span className="mono">{story.draft.styleMode}</span>}
                </div>
              )}
              <h3>{story.draft.headline}</h3>
              {story.draft.subheadline && <p className="meta">{story.draft.subheadline}</p>}
              {(story.draft.tamilConnection || story.draft.dachConnection) && (
                <div className="notice">
                  {story.draft.tamilConnection && <div><strong>Tamil-Bezug:</strong> {story.draft.tamilConnection}</div>}
                  {story.draft.dachConnection && <div><strong>DACH-Bezug:</strong> {story.draft.dachConnection}</div>}
                </div>
              )}
              {story.draft.summary && <p><strong>{story.draft.summary}</strong></p>}
              <div className="article-body">{renderBody(story.draft.body)}</div>
              {story.draft.headlineVariants.length > 0 && (
                <>
                  <h4>Schlagzeilen-Varianten</h4>
                  <ul>{story.draft.headlineVariants.map((v) => <li key={v}>{v}</li>)}</ul>
                </>
              )}
              {story.draft.uncertainNotes.length > 0 && (
                <div className="warning-box">
                  <strong>Unsichere Aussagen:</strong>
                  <ul>{story.draft.uncertainNotes.map((n) => <li key={n}>{n}</li>)}</ul>
                </div>
              )}
              <div className="meta">
                SEO: {story.draft.seoTitle} · Social: {story.draft.socialText}
              </div>
              <div className="meta">
                Erstellt: {formatDate(story.draft.generatedAt)}
                {story.draft.usage && (
                  <> · Tokens: {story.draft.usage.inputTokens} in / {story.draft.usage.outputTokens} out</>
                )}
              </div>
              {['published', 'updated'].includes(story.status) && (
                <p>
                  <Link className="btn" href={`/artikel/${encodeURIComponent(story.slug)}`}>
                    Öffentliche Seite öffnen
                  </Link>
                </p>
              )}
            </div>
          )}
          {story.draft && (
            <details className="card">
              <summary><strong>✏️ Entwurf bearbeiten</strong></summary>
              <form action={updateDraftAction}>
                <input type="hidden" name="storyId" value={story.id} />
                <label>Schlagzeile<input type="text" name="headline" defaultValue={story.draft.headline} /></label>
                <label>Unterüberschrift<input type="text" name="subheadline" defaultValue={story.draft.subheadline} /></label>
                <label>Kurzfassung<textarea name="summary" rows={3} defaultValue={story.draft.summary} /></label>
                <label>Text (Markdown, &quot;## &quot; für Zwischenüberschriften)
                  <textarea name="body" rows={14} defaultValue={story.draft.body} />
                </label>
                <label>Tags (kommagetrennt)<input type="text" name="tags" defaultValue={story.draft.tags.join(', ')} /></label>
                <label>SEO-Titel<input type="text" name="seoTitle" defaultValue={story.draft.seoTitle} /></label>
                <label>Meta-Beschreibung<input type="text" name="metaDescription" defaultValue={story.draft.metaDescription} /></label>
                <label>Social-Text<input type="text" name="socialText" defaultValue={story.draft.socialText} /></label>
                <div className="actions">
                  <button type="submit" className="primary">Änderungen speichern</button>
                </div>
              </form>
            </details>
          )}
        </section>

        <section>
          <h2>Quellenmeldungen <span className="meta">({items.length})</span></h2>
          {items.map((item) => (
            <div className="card" key={item.id}>
              <div className="meta">
                {item.sourceName} · {item.language.toUpperCase()} · {formatDate(item.publishedAt)}
              </div>
              <a href={item.url} target="_blank" rel="nofollow noopener">{item.title}</a>
              {item.summary && <p className="meta">{item.summary}</p>}
              {items.length > 1 && (
                <form action={detachItemAction} className="inline">
                  <input type="hidden" name="storyId" value={story.id} />
                  <input type="hidden" name="itemId" value={item.id} />
                  <button type="submit" title="Falsch zugeordnet? Wird eine eigene Story.">
                    ✂️ Aus Story lösen
                  </button>
                </form>
              )}
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
