import type { Store } from '@tnr/database';
import { type Story, newId, nowIso } from '@tnr/shared';

export interface WordPressConfig {
  url: string;
  user: string;
  appPassword: string;
  status: 'draft' | 'publish';
}

/** Liest die WordPress-Konfiguration aus der Umgebung (optional). */
export function getWordPressConfig(): WordPressConfig | null {
  const url = process.env.WORDPRESS_URL;
  const user = process.env.WORDPRESS_USER;
  const appPassword = process.env.WORDPRESS_APP_PASSWORD;
  if (!url || !user || !appPassword) return null;
  const status = process.env.WORDPRESS_PUBLISH_STATUS === 'publish' ? 'publish' : 'draft';
  return { url: url.replace(/\/+$/, ''), user, appPassword, status };
}

function draftBodyToHtml(body: string): string {
  return body
    .split(/\n{2,}/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('## ')) return `<h2>${escapeHtml(trimmed.slice(3))}</h2>`;
      return `<p>${escapeHtml(trimmed)}</p>`;
    })
    .filter(Boolean)
    .join('\n');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Pusht einen freigegebenen/veröffentlichten Artikel per REST API
 * (Application Password) nach WordPress. Erstellt beim ersten Mal einen
 * Beitrag, danach wird derselbe Beitrag aktualisiert (wordpressPostId).
 */
export async function pushToWordPress(
  store: Store,
  story: Story,
  actor: string
): Promise<{ postId: number; link?: string }> {
  const config = getWordPressConfig();
  if (!config) throw new Error('WordPress ist nicht konfiguriert (WORDPRESS_URL/USER/APP_PASSWORD)');
  if (!story.draft) throw new Error('Story hat keinen Entwurf');

  const sourcesHtml =
    '<hr /><p><strong>Quellen:</strong></p><ul>' +
    story.draft.sources
      .map((s) => `<li><a href="${s.url}" rel="nofollow noopener">${escapeHtml(s.sourceName)}</a></li>`)
      .join('') +
    '</ul>';

  const payload = {
    title: story.draft.headline,
    excerpt: story.draft.summary,
    content: draftBodyToHtml(story.draft.body) + sourcesHtml,
    status: config.status,
  };

  const isUpdate = typeof story.wordpressPostId === 'number';
  const endpoint = isUpdate
    ? `${config.url}/wp-json/wp/v2/posts/${story.wordpressPostId}`
    : `${config.url}/wp-json/wp/v2/posts`;
  const auth = Buffer.from(`${config.user}:${config.appPassword}`).toString('base64');

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const text = (await response.text()).slice(0, 300);
    throw new Error(`WordPress ${response.status}: ${text}`);
  }
  const post = (await response.json()) as { id: number; link?: string };

  await store.updateStory(story.id, { wordpressPostId: post.id, updatedAt: nowIso() });
  await store.addAudit({
    id: newId('aud'),
    at: nowIso(),
    actor,
    action: isUpdate ? 'wordpress.update' : 'wordpress.create',
    storyId: story.id,
    detail: `Post #${post.id} (${config.status})`,
  });
  return { postId: post.id, link: post.link };
}
