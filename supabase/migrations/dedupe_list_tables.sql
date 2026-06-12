-- Remove duplicate CMS rows created by repeated default seeding.
-- Keeps the row with the lowest id (uuid) per natural key within each table.

delete from public.important_dates a
using public.important_dates b
where a.title = b.title and a.id > b.id;

delete from public.speakers a
using public.speakers b
where a.name = b.name and a.id > b.id;

delete from public.topics a
using public.topics b
where a.name = b.name and a.id > b.id;

delete from public.workshops a
using public.workshops b
where a.title = b.title and a.id > b.id;

delete from public.sponsors a
using public.sponsors b
where a.name = b.name and a.id > b.id;

delete from public.quick_links a
using public.quick_links b
where a.title = b.title and a.id > b.id;

notify pgrst, 'reload schema';
