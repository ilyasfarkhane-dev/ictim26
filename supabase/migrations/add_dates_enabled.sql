-- Run once in Supabase → SQL Editor if date visibility toggles fail with:
-- "Could not find the 'enabled' column of 'important_dates' in the schema cache"

alter table public.important_dates
  add column if not exists enabled boolean not null default true;

notify pgrst, 'reload schema';
