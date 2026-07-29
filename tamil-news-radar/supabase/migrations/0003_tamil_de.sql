-- Umstellung auf Tamil.de: deutschsprachige Publikation, DACH-Region,
-- deutschsprachige Quellen (Google-News-Suchen mit Tamil-Bezug).

alter table sources drop constraint if exists sources_language_check;
alter table sources add constraint sources_language_check
  check (language in ('ta', 'en', 'si', 'de'));

alter table sources drop constraint if exists sources_region_check;
alter table sources add constraint sources_region_check
  check (region in ('IN', 'LK', 'INT', 'DACH'));

insert into sources (id, name, homepage, feed_url, type, language, region, trust_score, enabled, notes) values
  ('src_seed_21', 'Google News – „Tamilen" (DE)', 'https://news.google.com/?hl=de', 'https://news.google.com/rss/search?q=Tamilen&hl=de&gl=DE&ceid=DE:de', 'google-news', 'de', 'DACH', 65, true, null),
  ('src_seed_22', 'Google News – „Sri Lanka Tamilen" (DE)', 'https://news.google.com/?hl=de', 'https://news.google.com/rss/search?q=Sri%20Lanka%20Tamilen&hl=de&gl=DE&ceid=DE:de', 'google-news', 'de', 'DACH', 65, true, null),
  ('src_seed_23', 'Google News – „Tamil Nadu" (DE)', 'https://news.google.com/?hl=de', 'https://news.google.com/rss/search?q=%22Tamil%20Nadu%22&hl=de&gl=DE&ceid=DE:de', 'google-news', 'de', 'DACH', 65, true, null)
on conflict (id) do nothing;
