-- Run in Supabase SQL Editor if speakers table already exists without `enabled`
alter table public.speakers
  add column if not exists enabled boolean not null default true;
