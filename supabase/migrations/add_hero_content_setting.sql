-- Seed hero text content for dashboard-managed homepage hero.
-- Run in Supabase SQL Editor if hero_content is missing from site_settings.

insert into public.site_settings (key, value) values
  (
    'hero_content',
    '{"badge":"International Conference · TIM Laboratory","fullName":"The 8th International Conference on Information Technology and Modeling","title":"ICTIM''26","subtitle":"Information Technology & Modeling","tagline":"Innovation and Trends in Computer Science and Modeling: Bridging Theory, Practice, and the Power of AI","publication":"Proceedings published in Springer''s CCIS series. Extended versions of selected papers submitted to Scopus-indexed journals.","dates":"November 26 – 27, 2026","venue":"Faculty of Sciences Ben M''Sik | Casablanca - Morocco","ctas":[{"id":"cta-primary","label":"Call for Papers","href":"#call-for-papers","variant":"primary","enabled":true},{"id":"cta-secondary","label":"Important Dates","href":"#important-dates","variant":"secondary","enabled":true}]}'::jsonb
  )
on conflict (key) do update set value = excluded.value, updated_at = now();
