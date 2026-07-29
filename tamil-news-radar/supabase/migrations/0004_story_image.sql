-- Artikelbild pro Story (URL, Bildunterschrift, Credit, Lizenz, WP-Media-ID)
alter table stories add column if not exists image jsonb;
