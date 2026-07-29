/**
 * Einfaches In-Memory-Rate-Limiting (pro Prozess). Schützt Auth-Endpunkte gegen
 * Brute-Force. Für horizontale Skalierung später durch Redis o. Ä. ersetzen.
 */
interface Bucket {
  count: number;
  resetAt: number;
}
const buckets = new Map<string, Bucket>();

function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

/**
 * @returns true, wenn die Anfrage erlaubt ist; false, wenn das Limit erreicht ist.
 */
export function rateLimit(req: Request, action: string, max: number, windowMs: number): boolean {
  const key = `${action}:${clientIp(req)}`;
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= max) return false;
  bucket.count += 1;
  return true;
}

// Gelegentliches Aufräumen abgelaufener Buckets
let lastSweep = 0;
export function sweepRateLimits(now = Date.now()): void {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [k, b] of buckets) if (b.resetAt < now) buckets.delete(k);
}
