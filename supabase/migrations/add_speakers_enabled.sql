-- Run once in Supabase → SQL Editor if speaker edits fail with:
-- "Could not find the 'enabled' column of 'speakers' in the schema cache"

alter table public.speakers
  add column if not exists enabled boolean not null default true;

-- Refresh PostgREST schema cache so the API sees the new column immediately
notify pgrst, 'reload schema';
