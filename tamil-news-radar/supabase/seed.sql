-- Quellen-Startliste für Supabase.
-- Identisch zu packages/shared/src/seed-sources.ts (dort ist die
-- führende Fassung – bei Änderungen beide Dateien anpassen).
-- Feed-URLs mit "Feed-URL verifizieren" bitte nach dem ersten
-- Radar-Lauf im Dashboard prüfen.

insert into sources (id, name, homepage, feed_url, type, language, region, trust_score, enabled, notes) values
  ('src_seed_01', 'BBC Tamil', 'https://www.bbc.com/tamil', 'https://feeds.bbci.co.uk/tamil/rss.xml', 'rss', 'ta', 'INT', 90, true, null),
  ('src_seed_02', 'Google News (தமிழ்)', 'https://news.google.com/?hl=ta', 'https://news.google.com/rss?hl=ta&gl=IN&ceid=IN:ta', 'google-news', 'ta', 'IN', 70, true, null),
  ('src_seed_03', 'Google News – தமிழ்நாடு', 'https://news.google.com/?hl=ta', 'https://news.google.com/rss/search?q=%E0%AE%A4%E0%AE%AE%E0%AE%BF%E0%AE%B4%E0%AF%8D%E0%AE%A8%E0%AE%BE%E0%AE%9F%E0%AF%81&hl=ta&gl=IN&ceid=IN:ta', 'google-news', 'ta', 'IN', 70, true, null),
  ('src_seed_04', 'Google News – இலங்கை', 'https://news.google.com/?hl=ta', 'https://news.google.com/rss/search?q=%E0%AE%87%E0%AE%B2%E0%AE%99%E0%AF%8D%E0%AE%95%E0%AF%88&hl=ta&gl=IN&ceid=IN:ta', 'google-news', 'ta', 'LK', 70, true, null),
  ('src_seed_05', 'Hindu Tamil Thisai', 'https://www.hindutamil.in', 'https://www.hindutamil.in/rss/latest-news', 'rss', 'ta', 'IN', 85, true, 'Feed-URL verifizieren'),
  ('src_seed_06', 'Dinamani', 'https://www.dinamani.com', 'https://www.dinamani.com/rss/latest.xml', 'rss', 'ta', 'IN', 80, true, 'Feed-URL verifizieren'),
  ('src_seed_07', 'Dinamalar', 'https://www.dinamalar.com', 'https://rss.dinamalar.com/rss/latest', 'rss', 'ta', 'IN', 75, true, 'Feed-URL verifizieren'),
  ('src_seed_08', 'Maalaimalar', 'https://www.maalaimalar.com', 'https://www.maalaimalar.com/rss/latest-news', 'rss', 'ta', 'IN', 70, true, 'Feed-URL verifizieren'),
  ('src_seed_09', 'Puthiyathalaimurai', 'https://www.puthiyathalaimurai.com', 'https://www.puthiyathalaimurai.com/rss/latest-news', 'rss', 'ta', 'IN', 80, true, 'Feed-URL verifizieren'),
  ('src_seed_10', 'News18 Tamil', 'https://tamil.news18.com', 'https://tamil.news18.com/rss/tamilnadu.xml', 'rss', 'ta', 'IN', 70, true, 'Feed-URL verifizieren'),
  ('src_seed_11', 'Oneindia Tamil', 'https://tamil.oneindia.com', 'https://tamil.oneindia.com/rss/tamil-news.xml', 'rss', 'ta', 'IN', 65, true, 'Feed-URL verifizieren'),
  ('src_seed_12', 'The Hindu – Tamil Nadu', 'https://www.thehindu.com/news/national/tamil-nadu/', 'https://www.thehindu.com/news/national/tamil-nadu/feeder/default.rss', 'rss', 'en', 'IN', 90, true, null),
  ('src_seed_13', 'Times of India – Chennai', 'https://timesofindia.indiatimes.com/city/chennai', 'https://timesofindia.indiatimes.com/rssfeeds/2950623.cms', 'rss', 'en', 'IN', 75, true, null),
  ('src_seed_14', 'The New Indian Express – Tamil Nadu', 'https://www.newindianexpress.com/states/tamil-nadu', 'https://www.newindianexpress.com/States/Tamil-Nadu/rssfeed/?id=181&getXmlFeed=true', 'rss', 'en', 'IN', 80, true, 'Feed-URL verifizieren'),
  ('src_seed_15', 'Deccan Chronicle – Chennai', 'https://www.deccanchronicle.com', 'https://www.deccanchronicle.com/rss_feed/', 'rss', 'en', 'IN', 65, false, 'Feed grob, erst prüfen'),
  ('src_seed_16', 'Virakesari', 'https://www.virakesari.lk', 'https://www.virakesari.lk/rss', 'rss', 'ta', 'LK', 80, true, 'Feed-URL verifizieren'),
  ('src_seed_17', 'Tamil Guardian', 'https://www.tamilguardian.com', 'https://www.tamilguardian.com/rss.xml', 'rss', 'en', 'LK', 75, true, 'Feed-URL verifizieren'),
  ('src_seed_18', 'Colombo Gazette', 'https://colombogazette.com', 'https://colombogazette.com/feed/', 'rss', 'en', 'LK', 70, true, null),
  ('src_seed_19', 'EconomyNext', 'https://economynext.com', 'https://economynext.com/feed/', 'rss', 'en', 'LK', 75, true, null),
  ('src_seed_20', 'Daily Mirror Sri Lanka', 'https://www.dailymirror.lk', 'https://www.dailymirror.lk/rss', 'rss', 'en', 'LK', 75, true, 'Feed-URL verifizieren')
on conflict (id) do nothing;
