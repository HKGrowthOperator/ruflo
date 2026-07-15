import crypto from 'node:crypto';

export function newId(prefix: string): string {
  return `${prefix}_${crypto.randomBytes(8).toString('hex')}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function sha1(input: string): string {
  return crypto.createHash('sha1').update(input).digest('hex');
}

/** Slug aus (tamilischem) Titel: Unicode-Buchstaben/Ziffern behalten. */
export function slugify(title: string, fallback: string): string {
  const slug = title
    .normalize('NFC')
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return slug.length >= 3 ? slug : fallback;
}

/** Tokenisierung für Titel-Ähnlichkeit (whitespace-basiert, Unicode-safe). */
export function tokenize(text: string): Set<string> {
  return new Set(
    text
      .normalize('NFC')
      .toLowerCase()
      .replace(/[^\p{L}\p{M}\p{N}\s]+/gu, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 1)
  );
}

/** Jaccard-Ähnlichkeit zweier Token-Mengen. */
export function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / (a.size + b.size - inter);
}

/**
 * Titel-Ähnlichkeit fürs Clustering: max(Jaccard, gedämpfter
 * Overlap-Koeffizient). Der Overlap-Anteil fängt zweisprachige oder
 * verlängerte Titel ab (z. B. "Chennai bus fare hike: சென்னை … உயர்வு"),
 * bei denen Jaccard durch die Extra-Tokens verwässert wird.
 */
export function titleSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  const jac = inter / (a.size + b.size - inter);
  const overlap = inter / Math.min(a.size, b.size);
  return Math.max(jac, 0.75 * overlap);
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#\d+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function truncate(text: string, max: number): string {
  return text.length <= max ? text : text.slice(0, max - 1).trimEnd() + '…';
}
