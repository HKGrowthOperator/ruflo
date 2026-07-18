/** Öffentliche Basis-URL der Website (für Feed, Sitemap, OpenGraph). */
export function getSiteUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
    'http://localhost:3000';
  return url.replace(/\/+$/, '');
}

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Tamil.de';

export function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
