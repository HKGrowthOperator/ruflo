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

/** Automatischer Push beim Veröffentlichen (Standard: an, sobald WP konfiguriert). */
export function isAutoPushEnabled(): boolean {
  return getWordPressConfig() !== null && process.env.WORDPRESS_AUTO_PUSH !== 'false';
}

export interface WordPressConnectionStatus {
  configured: boolean;
  ok: boolean;
  /** Angemeldeter WP-Benutzer (bei Erfolg) */
  user?: string;
  categories?: Array<{ id: number; name: string; count: number }>;
  error?: string;
}

/**
 * Echter Verbindungstest gegen die WordPress-REST-API: authentifizierter
 * Abruf des eigenen Benutzers + der Kategorien. Kein simulierter Status.
 */
export async function testWordPressConnection(): Promise<WordPressConnectionStatus> {
  const config = getWordPressConfig();
  if (!config) {
    return {
      configured: false, ok: false,
      error: 'WORDPRESS_URL / WORDPRESS_USER / WORDPRESS_APP_PASSWORD nicht gesetzt',
    };
  }
  const auth = Buffer.from(`${config.user}:${config.appPassword}`).toString('base64');
  const headers = { Authorization: `Basic ${auth}` };
  try {
    const me = await fetch(`${config.url}/wp-json/wp/v2/users/me?context=edit`, {
      headers, signal: AbortSignal.timeout(15_000),
    });
    if (!me.ok) {
      return {
        configured: true, ok: false,
        error: `Authentifizierung fehlgeschlagen (HTTP ${me.status}) – Application Password prüfen`,
      };
    }
    const user = (await me.json()) as { name?: string; slug?: string };

    const cats = await fetch(`${config.url}/wp-json/wp/v2/categories?per_page=100`, {
      headers, signal: AbortSignal.timeout(15_000),
    });
    const categories = cats.ok
      ? ((await cats.json()) as Array<{ id: number; name: string; count: number }>).map(
          (c) => ({ id: c.id, name: c.name, count: c.count })
        )
      : undefined;

    return { configured: true, ok: true, user: user.name ?? user.slug, categories };
  } catch (error) {
    return {
      configured: true, ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Lädt das Artikelbild in die WordPress-Mediathek hoch und setzt
 * Bildunterschrift + Credit. Gibt die Media-ID zurück (wird an der
 * Story gespeichert, damit nicht doppelt hochgeladen wird).
 */
async function uploadImageToWordPress(
  config: WordPressConfig,
  story: Story,
  auth: string
): Promise<number> {
  const image = story.image!;
  const source = await fetch(image.url, { signal: AbortSignal.timeout(20_000) });
  if (!source.ok) throw new Error(`Bild-Download ${source.status}: ${image.url}`);
  const contentType = source.headers.get('content-type') ?? 'image/jpeg';
  if (!contentType.startsWith('image/')) {
    throw new Error(`Bild-URL liefert kein Bild (Content-Type: ${contentType})`);
  }
  const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
  const body = Buffer.from(await source.arrayBuffer());

  const upload = await fetch(`${config.url}/wp-json/wp/v2/media`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="tamilde-${story.id}.${ext}"`,
    },
    body,
  });
  if (!upload.ok) {
    throw new Error(`WordPress-Media ${upload.status}: ${(await upload.text()).slice(0, 200)}`);
  }
  const media = (await upload.json()) as { id: number };

  const captionParts = [image.caption, image.credit ? `Bild: ${image.credit}` : '']
    .filter(Boolean)
    .join(' – ');
  if (captionParts) {
    await fetch(`${config.url}/wp-json/wp/v2/media/${media.id}`, {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ caption: captionParts, alt_text: image.caption ?? '' }),
    });
  }
  return media.id;
}

/**
 * Pusht einen freigegebenen/veröffentlichten Artikel per REST API
 * (Application Password) nach WordPress – inkl. Bild als Beitragsbild.
 * Erstellt beim ersten Mal einen Beitrag, danach wird derselbe Beitrag
 * aktualisiert (wordpressPostId).
 */
export async function pushToWordPress(
  store: Store,
  story: Story,
  actor: string
): Promise<{ postId: number; link?: string }> {
  const config = getWordPressConfig();
  if (!config) throw new Error('WordPress ist nicht konfiguriert (WORDPRESS_URL/USER/APP_PASSWORD)');
  if (!story.draft) throw new Error('Story hat keinen Entwurf');
  const draft = story.draft;

  const sourcesHtml =
    '<div class="article-sources"><hr />' +
    '<p><strong>Quellen und weiterführende Informationen</strong></p><ul>' +
    draft.sources
      .map((s) => `<li><a href="${s.url}" rel="nofollow noopener">${escapeHtml(s.sourceName)}</a>: ${escapeHtml(s.title)}</li>`)
      .join('') +
    '</ul><p><em>Redaktioneller Hinweis: Dieser Beitrag wurde auf Grundlage mehrerer ' +
    'öffentlich zugänglicher Quellen durch die Tamil.de-Redaktion erstellt.</em></p></div>';

  const auth = Buffer.from(`${config.user}:${config.appPassword}`).toString('base64');

  // Bild zuerst: einmalig in die Mediathek hochladen, dann als Beitragsbild
  let imagePatch: Partial<Story> | null = null;
  if (story.image && !story.image.wpMediaId) {
    const mediaId = await uploadImageToWordPress(config, story, auth);
    story = { ...story, image: { ...story.image, wpMediaId: mediaId } };
    imagePatch = { image: story.image };
  }

  const payload: Record<string, unknown> = {
    title: draft.headline,
    excerpt: draft.summary,
    content: draftBodyToHtml(draft.body) + sourcesHtml,
    status: config.status,
  };
  if (story.image?.wpMediaId) payload.featured_media = story.image.wpMediaId;

  const isUpdate = typeof story.wordpressPostId === 'number';
  const endpoint = isUpdate
    ? `${config.url}/wp-json/wp/v2/posts/${story.wordpressPostId}`
    : `${config.url}/wp-json/wp/v2/posts`;

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

  await store.updateStory(story.id, {
    wordpressPostId: post.id,
    updatedAt: nowIso(),
    ...(imagePatch ?? {}),
  });
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
