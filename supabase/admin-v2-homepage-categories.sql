alter table public.site_settings
  add column if not exists homepage_category_slugs text[] not null default '{}';