import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getStore } from '@tnr/database';
import { canTransition, getWordPressConfig } from '@tnr/editorial';
import { STATUS_LABELS } from '@tnr/shared';
import { formatDate, renderBody } from '../../../../lib/format';
import {
  draftStoryAction, pushWordPressAction, refreshStoryAction,
  transitionStoryAction, updateDraftAction,
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
              <h3>{story.draft.headline}</h3>
              {story.draft.subheadline && <p className="meta">{story.draft.subheadline}</p>}
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
              <div className="meta">Erstellt: {formatDate(story.draft.generatedAt)}</div>
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
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
