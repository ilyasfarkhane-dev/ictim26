-- Seed navbar previous editions dropdown for dashboard management.
-- Run in Supabase SQL Editor if previous_editions is missing from site_settings.

insert into public.site_settings (key, value) values
  (
    'previous_editions',
    '{"label":"Previous Editions","items":[{"id":"edition-1","label":"TIM''14","subtitle":"1st Edition","href":"https://www.conference-tim.com/","enabled":true},{"id":"edition-2","label":"TIM''15","subtitle":"2nd Edition","href":"https://www.conference-tim.com/","enabled":true},{"id":"edition-3","label":"TIM''16","subtitle":"3rd Edition","href":"https://www.conference-tim.com/","enabled":true},{"id":"edition-4","label":"TIM''22","subtitle":"6th Edition","href":"https://www.conference-tim.com/","enabled":true},{"id":"edition-5","label":"ICTIM''24","subtitle":"7th Edition","href":"https://www.conference-tim.com/","enabled":true}]}'::jsonb
  )
on conflict (key) do update set value = excluded.value, updated_at = now();
