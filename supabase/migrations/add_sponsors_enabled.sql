-- Run once in Supabase → SQL Editor if sponsor visibility toggles fail with:
-- "Could not find the 'enabled' column of 'sponsors' in the schema cache"

alter table public.sponsors
  add column if not exists enabled boolean not null default true;

notify pgrst, 'reload schema';
