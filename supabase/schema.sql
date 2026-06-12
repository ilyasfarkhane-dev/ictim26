-- ICTIM Conference CMS — run in Supabase SQL Editor

create extension if not exists "pgcrypto";

-- ─── Tables ───────────────────────────────────────────────────────────────

create table if not exists public.speakers (
  id uuid primary key default gen_random_uuid(),
  sort_order integer not null default 0,
  name text not null,
  position text,
  company text,
  bio text,
  image_url text,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  sort_order integer not null default 0,
  name text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.important_dates (
  id uuid primary key default gen_random_uuid(),
  sort_order integer not null default 0,
  step text,
  title text not null,
  date text,
  description text,
  icon text,
  image_url text,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workshops (
  id uuid primary key default gen_random_uuid(),
  sort_order integer not null default 0,
  number integer,
  title text not null,
  subtitle text,
  description text,
  facilitator_name text,
  facilitator_credentials text,
  objectives jsonb not null default '[]'::jsonb,
  duration text,
  price numeric,
  currency text default 'DH',
  image_url text,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sponsors (
  id uuid primary key default gen_random_uuid(),
  sort_order integer not null default 0,
  name text not null,
  logo_url text,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quick_links (
  id uuid primary key default gen_random_uuid(),
  sort_order integer not null default 0,
  title text not null,
  description text,
  href text,
  icon text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- ─── Updated-at trigger ───────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$ declare t text;
begin
  foreach t in array array[
    'speakers','topics','important_dates','workshops',
    'sponsors','quick_links','site_settings'
  ] loop
    execute format('drop trigger if exists trg_%s_updated on public.%I', t, t);
    execute format(
      'create trigger trg_%s_updated before update on public.%I
       for each row execute function public.set_updated_at()',
      t, t
    );
  end loop;
end $$;

-- ─── Row Level Security ───────────────────────────────────────────────────

alter table public.speakers enable row level security;
alter table public.topics enable row level security;
alter table public.important_dates enable row level security;
alter table public.workshops enable row level security;
alter table public.sponsors enable row level security;
alter table public.quick_links enable row level security;
alter table public.site_settings enable row level security;

-- Public read (website)
create policy "public_read_speakers" on public.speakers for select using (true);
create policy "public_read_topics" on public.topics for select using (true);
create policy "public_read_dates" on public.important_dates for select using (true);
create policy "public_read_workshops" on public.workshops for select using (true);
create policy "public_read_sponsors" on public.sponsors for select using (true);
create policy "public_read_quick_links" on public.quick_links for select using (true);
create policy "public_read_settings" on public.site_settings for select using (true);

-- Authenticated write (dashboard)
create policy "auth_insert_speakers" on public.speakers for insert to authenticated with check (true);
create policy "auth_update_speakers" on public.speakers for update to authenticated using (true);
create policy "auth_delete_speakers" on public.speakers for delete to authenticated using (true);

create policy "auth_insert_topics" on public.topics for insert to authenticated with check (true);
create policy "auth_update_topics" on public.topics for update to authenticated using (true);
create policy "auth_delete_topics" on public.topics for delete to authenticated using (true);

create policy "auth_insert_dates" on public.important_dates for insert to authenticated with check (true);
create policy "auth_update_dates" on public.important_dates for update to authenticated using (true);
create policy "auth_delete_dates" on public.important_dates for delete to authenticated using (true);

create policy "auth_insert_workshops" on public.workshops for insert to authenticated with check (true);
create policy "auth_update_workshops" on public.workshops for update to authenticated using (true);
create policy "auth_delete_workshops" on public.workshops for delete to authenticated using (true);

create policy "auth_insert_sponsors" on public.sponsors for insert to authenticated with check (true);
create policy "auth_update_sponsors" on public.sponsors for update to authenticated using (true);
create policy "auth_delete_sponsors" on public.sponsors for delete to authenticated using (true);

create policy "auth_insert_quick_links" on public.quick_links for insert to authenticated with check (true);
create policy "auth_update_quick_links" on public.quick_links for update to authenticated using (true);
create policy "auth_delete_quick_links" on public.quick_links for delete to authenticated using (true);

create policy "auth_insert_settings" on public.site_settings for insert to authenticated with check (true);
create policy "auth_update_settings" on public.site_settings for update to authenticated using (true);
create policy "auth_delete_settings" on public.site_settings for delete to authenticated using (true);
