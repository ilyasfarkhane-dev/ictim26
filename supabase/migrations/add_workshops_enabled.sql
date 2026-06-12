-- Run once in Supabase → SQL Editor if workshop visibility toggles fail with:
-- "Could not find the 'enabled' column of 'workshops' in the schema cache"

alter table public.workshops
  add column if not exists enabled boolean not null default true;

notify pgrst, 'reload schema';
