/**
 * Relevanz- und Risikobewertung (Redaktionsstandard Abschnitte 7/8/13):
 * Score 0–100 aus sechs Komponenten, Risikoklassen green/yellow/red.
 * Heuristische Basis-Stufe; der KI-Provider kann die Einschätzung beim
 * Entwurf verfeinern. Listen bewusst pflegbar gehalten.
 */

export type RiskLevel = 'green' | 'yellow' | 'red';

export interface RelevanceScore {
  tamil: number; // 0–30
  dach: number; // 0–20
  recency: number; // 0–15
  communityValue: number; // 0–15
  publicInterest: number; // 0–10
  sourceQuality: number; // 0–10
  total: number; // 0–100
}

/** Stufe 1: direkte Treffer → volle 30 Punkte Tamil-Bezug */
const TAMIL_DIRECT = [
  'tamil', 'tamilin', 'tamilen', 'tamilisch', 'tamil nadu', 'chennai',
  'jaffna', 'eelam', 'kollywood', 'batticaloa', 'trincomalee', 'madurai',
  'coimbatore', 'yalpanam', 'தமிழ', 'சென்னை', 'யாழ',
];

/** Indirekter Tamil-Kontext → 15 Punkte */
const TAMIL_INDIRECT = [
  'sri lanka', 'sri-lanka', 'srilanka', 'colombo', 'hindu-tempel',
  'hindutempel', 'bharatanatyam', 'pongal', 'kovil', 'ltte', 'இலங்கை',
];

const DACH_KEYWORDS = [
  'deutschland', 'österreich', 'schweiz', 'dach-raum', 'deutsche', 'deutschen',
  'berlin', 'hamburg', 'köln', 'dortmund', 'frankfurt', 'stuttgart', 'münchen',
  'hannover', 'essen', 'düsseldorf', 'bremen', 'nrw', 'hessen', 'bayern',
  'zürich', 'bern', 'basel', 'genf', 'wien', 'graz', 'linz',
];

const COMMUNITY_VALUE_KEYWORDS = [
  'veranstaltung', 'konzert', 'festival', 'tempelfest', 'fest', 'kino',
  'kinostart', 'film', 'workshop', 'visum', 'einreise', 'reise', 'termine',
  'anmeldung', 'tickets', 'gemeinde', 'verein', 'schule', 'kulturzentrum',
];

const PUBLIC_INTEREST_KEYWORDS = [
  'wahl', 'regierung', 'parlament', 'minister', 'gericht', 'urteil',
  'preis', 'auszeichnung', 'gewinnt', 'gewählt', 'ernannt', 'rekord',
  'streik', 'gesetz', 'reform',
];

/** YELLOW: sensibel → immer menschliche Freigabe, deutlicher Prüfhinweis */
const YELLOW_KEYWORDS = [
  'politik', 'wahl', 'regierung', 'partei', 'demonstration', 'protest',
  'gericht', 'prozess', 'urteil', 'anklage', 'vorwurf', 'vorwürfe',
  'unfall', 'tot', 'tod', 'tote', 'getötet', 'gestorben', 'mord',
  'krieg', 'bürgerkrieg', 'konflikt', 'ltte', 'anschlag', 'polizei',
  'abschiebung', 'migration', 'asyl', 'flüchtling', 'geflüchtete',
  'gesundheit', 'krankheit', 'klinik', 'minderjährig', 'kinder',
  'religion', 'menschenrechte',
];

/** RED: nie automatisch verarbeiten (kein Auto-Entwurf) */
const RED_KEYWORDS = [
  'gerücht', 'gerüchte', 'unbestätigt', 'anonyme quelle', 'anonymen quellen',
  'soll angeblich', 'angeblich', 'privatadresse', 'privatnummer',
  'identität des opfers', 'opfer identifiziert', 'diagnose',
];

function normalize(text: string): string {
  return text.normalize('NFC').toLowerCase();
}

function containsAny(text: string, keywords: string[]): boolean {
  return keywords.some((k) => text.includes(k));
}

export function scoreRelevance(input: {
  text: string;
  publishedAt?: string;
  sourceTrust?: number; // 0–100
  sourceRegionDach?: boolean;
  /** Meldung stammt aus einer tamilischsprachigen Quelle → inhärenter Tamil-Bezug */
  sourceLanguageTamil?: boolean;
}): RelevanceScore {
  const text = normalize(input.text);

  let tamil = containsAny(text, TAMIL_DIRECT) ? 30
    : containsAny(text, TAMIL_INDIRECT) ? 15 : 0;
  if (input.sourceLanguageTamil) tamil = Math.max(tamil, 25);

  const dach = containsAny(text, DACH_KEYWORDS) ? 20
    : input.sourceRegionDach ? 12 : 0;

  let recency = 0;
  if (input.publishedAt) {
    const ageHours = (Date.now() - new Date(input.publishedAt).getTime()) / 3600_000;
    recency = ageHours <= 24 ? 15 : ageHours <= 72 ? 10 : ageHours <= 168 ? 5 : 0;
  }

  const communityValue = containsAny(text, COMMUNITY_VALUE_KEYWORDS) ? 15 : 5;
  const publicInterest = containsAny(text, PUBLIC_INTEREST_KEYWORDS) ? 10 : 5;
  const sourceQuality = Math.round(Math.max(0, Math.min(100, input.sourceTrust ?? 60)) / 10);

  return {
    tamil, dach, recency, communityValue, publicInterest, sourceQuality,
    total: tamil + dach + recency + communityValue + publicInterest + sourceQuality,
  };
}

export function classifyRisk(text: string): RiskLevel {
  const normalized = normalize(text);
  if (containsAny(normalized, RED_KEYWORDS)) return 'red';
  if (containsAny(normalized, YELLOW_KEYWORDS)) return 'yellow';
  return 'green';
}

/** Schwellwerte aus dem Redaktionsstandard (Abschnitt 7). */
export const RELEVANCE_DISCARD_BELOW = 40;
export const RELEVANCE_WATCH_BELOW = 50;
