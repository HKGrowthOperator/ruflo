-- Tamil News Radar – Grundschema (Supabase/Postgres)
-- Spiegel der TypeScript-Typen in packages/shared/src/types.ts

create table if not exists sources (
  id                text primary key,
  name              text not null,
  homepage          text not null,
  feed_url          text not null,
  type              text not null check (type in ('rss', 'google-news')),
  language          text not null check (language in ('ta', 'en', 'si', 'de')),
  region            text not null check (region in ('IN', 'LK', 'INT', 'DACH')),
  trust_score       integer not null default 70 check (trust_score between 0 and 100),
  enabled           boolean not null default true,
  notes             text,
  last_fetch_at     timestamptz,
  last_fetch_status text check (last_fetch_status in ('ok', 'error')),
  last_fetch_error  text,
  last_fetch_items  integer
);

create table if not exists raw_items (
  id           text primary key,
  source_id    text not null references sources(id),
  source_name  text not null,
  guid         text not null unique,
  url          text not null,
  title        text not null,
  summary      text not null default '',
  published_at timestamptz,
  fetched_at   timestamptz not null,
  language     text not null
);
create index if not exists raw_items_url_idx on raw_items(url);
create index if not exists raw_items_fetched_idx on raw_items(fetched_at desc);

create table if not exists stories (
  id                text primary key,
  slug              text not null unique,
  working_title     text not null,
  category          text not null,
  region            text,
  status            text not null check (status in (
    'detected', 'researching', 'drafted', 'in_review', 'changes_requested',
    'approved', 'scheduled', 'published', 'updated', 'archived'
  )),
  item_ids          text[] not null default '{}',
  draft             jsonb,
  warnings          text[] not null default '{}',
  review_note       text,
  published_at      timestamptz,
  wordpress_post_id integer,
  created_at        timestamptz not null,
  updated_at        timestamptz not null
);
create index if not exists stories_status_idx on stories(status);
create index if not exists stories_updated_idx on stories(updated_at desc);

create table if not exists audit_log (
  id       text primary key,
  at       timestamptz not null,
  actor    text not null,
  action   text not null,
  story_id text,
  detail   text
);
create index if not exists audit_at_idx on audit_log(at desc);

-- Zugriff erfolgt ausschließlich serverseitig über den Service-Role-Key;
-- RLS aktivieren, damit der anon-Key nichts lesen kann.
alter table sources enable row level security;
alter table raw_items enable row level security;
alter table stories enable row level security;
alter table audit_log enable row level security;
