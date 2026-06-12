-- Seed hero publisher logos for dashboard-managed homepage hero strip.
-- Run in Supabase SQL Editor if hero_sponsors is missing from site_settings.

insert into public.site_settings (key, value) values
  (
    'hero_sponsors',
    '[{"id":"sponsor-1","name":"Springer","logoUrl":"https://cdn.simpleicons.org/springer/1E40AF","enabled":true},{"id":"sponsor-2","name":"Scopus","logoUrl":"https://cdn.simpleicons.org/elsevier/1E40AF","enabled":true},{"id":"sponsor-3","name":"CCIS","logoUrl":"https://cdn.simpleicons.org/springer/1E40AF","enabled":true}]'::jsonb
  )
on conflict (key) do update set value = excluded.value, updated_at = now();
