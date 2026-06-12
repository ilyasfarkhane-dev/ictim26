-- Seed committees content + section visibility toggle.
-- Run in Supabase SQL Editor if committees are missing from site_settings.

insert into public.site_settings (key, value) values
  (
    'committees',
    '{"programChairs":[{"id":"pch-1","name":"Prof. El Habib Benlahmar","affiliation":"Faculty of Sciences Ben M''Sick (FSBM), Hassan II University of Casablanca, Morocco","enabled":true},{"id":"pch-2","name":"Prof. Omar Zahour","affiliation":"Faculty of Sciences Ben M''Sick (FSBM), Hassan II University of Casablanca, Morocco","enabled":true},{"id":"pch-3","name":"Prof. Jaouad Dabounou","affiliation":"Hassan II University, Morocco","enabled":true},{"id":"pch-4","name":"Prof. Ángel Ruiz Zafra","affiliation":"University of Granada, Spain","enabled":true}],"externalReviewers":[{"id":"er-1","name":"Prof. Leila Alem","affiliation":"University of Technology Sydney, Australia","enabled":true},{"id":"er-2","name":"Prof. Arbi Adene","affiliation":"University of Carthage, Tunisia","enabled":true},{"id":"er-3","name":"Prof. Medhat Mahmoud","affiliation":"Expert Technologie, Cairo, Egypt","enabled":true},{"id":"er-4","name":"Prof. Ángel Ruiz Zafra","affiliation":"University of Granada, Spain","enabled":true},{"id":"er-5","name":"Dr. Kawtar Benghazi Akhlaki Sekkate","affiliation":"University of Granada, Spain","enabled":true},{"id":"er-6","name":"Prof. Olivier Debauche","affiliation":"University of Liège, Belgium","enabled":true},{"id":"er-7","name":"Prof. Anderson Rocha","affiliation":"University of Campinas (UNICAMP), Brazil","enabled":true},{"id":"er-8","name":"Prof. Mamadou Lamine Gueye","affiliation":"University of Pau and Pays de l''Adour, France","enabled":true},{"id":"er-9","name":"Prof. Michael Kikomba Kahungu","affiliation":"ISP-Gombe, DR Congo","enabled":true},{"id":"er-10","name":"Prof. Mu''azu Muhammed Bashir","affiliation":"Ahmadu Bello University, Nigeria","enabled":true},{"id":"er-11","name":"Prof. Mohammed Mestari","affiliation":"ENSET Mohammedia, Hassan II University, Morocco","enabled":true},{"id":"er-12","name":"Prof. Rachid Saadane","affiliation":"Hassan II University of Casablanca, Morocco","enabled":true}],"organizing":{"programChairs":[{"id":"org-pc-1","name":"Prof. El Habib Benlahmar","affiliation":"Faculty of Sciences Ben M''Sick (FSBM), Hassan II University of Casablanca, Morocco","email":"h.benlahmer@gmail.com","enabled":true},{"id":"org-pc-2","name":"Prof. Omar Zahour","affiliation":"Faculty of Sciences Ben M''Sick (FSBM), Hassan II University of Casablanca, Morocco","enabled":true}],"institution":{"name":"AM2I & LTIM & FSBM","address":"Hassan II University of Casablanca, Bd Commandant Driss Al Harti, Casablanca 20670, Morocco"}}}'::jsonb
  )
on conflict (key) do update set value = excluded.value, updated_at = now();

update public.site_settings
set value = coalesce(value, '{}'::jsonb) || '{"committees":{"enabled":true}}'::jsonb,
    updated_at = now()
where key = 'section_settings';

insert into public.site_settings (key, value)
select 'section_settings', '{"committees":{"enabled":true}}'::jsonb
where not exists (select 1 from public.site_settings where key = 'section_settings');
