import type { Source } from './types';

/**
 * Startliste der Quellen (Frage 13). Feed-URLs sind nach bestem Wissen
 * eingetragen; der Radar prüft sie bei jedem Lauf und zeigt den
 * Abrufstatus im Dashboard (Quellen mit Fehlern dort korrigieren).
 * trustScore: 0–100, vom Admin anpassbar.
 */
export const SEED_SOURCES: Omit<Source, 'id'>[] = [
  // ── Tamilischsprachig, Indien / Tamil Nadu ──────────────────
  { name: 'BBC Tamil', homepage: 'https://www.bbc.com/tamil', feedUrl: 'https://feeds.bbci.co.uk/tamil/rss.xml', type: 'rss', language: 'ta', region: 'INT', trustScore: 90, enabled: true },
  { name: 'Google News (தமிழ்)', homepage: 'https://news.google.com/?hl=ta', feedUrl: 'https://news.google.com/rss?hl=ta&gl=IN&ceid=IN:ta', type: 'google-news', language: 'ta', region: 'IN', trustScore: 70, enabled: true },
  { name: 'Google News – தமிழ்நாடு', homepage: 'https://news.google.com/?hl=ta', feedUrl: 'https://news.google.com/rss/search?q=%E0%AE%A4%E0%AE%AE%E0%AE%BF%E0%AE%B4%E0%AF%8D%E0%AE%A8%E0%AE%BE%E0%AE%9F%E0%AF%81&hl=ta&gl=IN&ceid=IN:ta', type: 'google-news', language: 'ta', region: 'IN', trustScore: 70, enabled: true },
  { name: 'Google News – இலங்கை', homepage: 'https://news.google.com/?hl=ta', feedUrl: 'https://news.google.com/rss/search?q=%E0%AE%87%E0%AE%B2%E0%AE%99%E0%AF%8D%E0%AE%95%E0%AF%88&hl=ta&gl=IN&ceid=IN:ta', type: 'google-news', language: 'ta', region: 'LK', trustScore: 70, enabled: true },
  { name: 'Hindu Tamil Thisai', homepage: 'https://www.hindutamil.in', feedUrl: 'https://www.hindutamil.in/rss/latest-news', type: 'rss', language: 'ta', region: 'IN', trustScore: 85, enabled: true, notes: 'Feed-URL verifizieren' },
  { name: 'Dinamani', homepage: 'https://www.dinamani.com', feedUrl: 'https://www.dinamani.com/rss/latest.xml', type: 'rss', language: 'ta', region: 'IN', trustScore: 80, enabled: true, notes: 'Feed-URL verifizieren' },
  { name: 'Dinamalar', homepage: 'https://www.dinamalar.com', feedUrl: 'https://rss.dinamalar.com/rss/latest', type: 'rss', language: 'ta', region: 'IN', trustScore: 75, enabled: true, notes: 'Feed-URL verifizieren' },
  { name: 'Maalaimalar', homepage: 'https://www.maalaimalar.com', feedUrl: 'https://www.maalaimalar.com/rss/latest-news', type: 'rss', language: 'ta', region: 'IN', trustScore: 70, enabled: true, notes: 'Feed-URL verifizieren' },
  { name: 'Puthiyathalaimurai', homepage: 'https://www.puthiyathalaimurai.com', feedUrl: 'https://www.puthiyathalaimurai.com/rss/latest-news', type: 'rss', language: 'ta', region: 'IN', trustScore: 80, enabled: true, notes: 'Feed-URL verifizieren' },
  { name: 'News18 Tamil', homepage: 'https://tamil.news18.com', feedUrl: 'https://tamil.news18.com/rss/tamilnadu.xml', type: 'rss', language: 'ta', region: 'IN', trustScore: 70, enabled: true, notes: 'Feed-URL verifizieren' },
  { name: 'Oneindia Tamil', homepage: 'https://tamil.oneindia.com', feedUrl: 'https://tamil.oneindia.com/rss/tamil-news.xml', type: 'rss', language: 'ta', region: 'IN', trustScore: 65, enabled: true, notes: 'Feed-URL verifizieren' },

  // ── Englischsprachig, Indien / Tamil Nadu ───────────────────
  { name: 'The Hindu – Tamil Nadu', homepage: 'https://www.thehindu.com/news/national/tamil-nadu/', feedUrl: 'https://www.thehindu.com/news/national/tamil-nadu/feeder/default.rss', type: 'rss', language: 'en', region: 'IN', trustScore: 90, enabled: true },
  { name: 'Times of India – Chennai', homepage: 'https://timesofindia.indiatimes.com/city/chennai', feedUrl: 'https://timesofindia.indiatimes.com/rssfeeds/2950623.cms', type: 'rss', language: 'en', region: 'IN', trustScore: 75, enabled: true },
  { name: 'The New Indian Express – Tamil Nadu', homepage: 'https://www.newindianexpress.com/states/tamil-nadu', feedUrl: 'https://www.newindianexpress.com/States/Tamil-Nadu/rssfeed/?id=181&getXmlFeed=true', type: 'rss', language: 'en', region: 'IN', trustScore: 80, enabled: true, notes: 'Feed-URL verifizieren' },
  { name: 'Deccan Chronicle – Chennai', homepage: 'https://www.deccanchronicle.com', feedUrl: 'https://www.deccanchronicle.com/rss_feed/', type: 'rss', language: 'en', region: 'IN', trustScore: 65, enabled: false, notes: 'Feed grob, erst prüfen' },

  // ── Sri Lanka ───────────────────────────────────────────────
  { name: 'Virakesari', homepage: 'https://www.virakesari.lk', feedUrl: 'https://www.virakesari.lk/rss', type: 'rss', language: 'ta', region: 'LK', trustScore: 80, enabled: true, notes: 'Feed-URL verifizieren' },
  { name: 'Tamil Guardian', homepage: 'https://www.tamilguardian.com', feedUrl: 'https://www.tamilguardian.com/rss.xml', type: 'rss', language: 'en', region: 'LK', trustScore: 75, enabled: true, notes: 'Feed-URL verifizieren' },
  { name: 'Colombo Gazette', homepage: 'https://colombogazette.com', feedUrl: 'https://colombogazette.com/feed/', type: 'rss', language: 'en', region: 'LK', trustScore: 70, enabled: true },
  { name: 'EconomyNext', homepage: 'https://economynext.com', feedUrl: 'https://economynext.com/feed/', type: 'rss', language: 'en', region: 'LK', trustScore: 75, enabled: true },
  { name: 'Daily Mirror Sri Lanka', homepage: 'https://www.dailymirror.lk', feedUrl: 'https://www.dailymirror.lk/rss', type: 'rss', language: 'en', region: 'LK', trustScore: 75, enabled: true, notes: 'Feed-URL verifizieren' },
];
