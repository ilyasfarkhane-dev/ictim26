-- Run once in Supabase → SQL Editor if topic toggles fail with:
-- "Could not find the 'enabled' column of 'topics' in the schema cache"

alter table public.topics
  add column if not exists enabled boolean not null default true;

notify pgrst, 'reload schema';
