-- Run in Supabase Dashboard > SQL Editor if site settings updates fail.

create table if not exists public.site_settings (
  id text primary key default 'main',
  offer_text text not null default 'Free shipping on orders over Rs. 999 | New season offers are live',
  banner_image_url text not null default '/banners/banner-1.png',
  shipping_charge numeric not null default 40,
  new_arrival_slugs text[] not null default '{}',
  best_seller_slugs text[] not null default '{}',
  featured_slugs text[] not null default '{}',
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton check (id = 'main')
);

alter table public.site_settings
add column if not exists shipping_charge numeric not null default 40;

insert into public.site_settings (id)
values ('main')
on conflict (id) do nothing;

alter table public.site_settings enable row level security;

alter table public.site_settings
add column if not exists banner_slides jsonb;

alter table public.site_settings
add column if not exists homepage_category_slugs text[] not null default '{}';

update public.site_settings
set banner_slides =
  case
    when banner_image_url is not null
      and btrim(banner_image_url) <> ''
      and banner_image_url not in (
        '/banners/banner-1.png',
        '/banners/banner-2.png',
        '/banners/banner-3.png'
      )
    then jsonb_build_array(
      jsonb_build_object(
        'id', 'legacy-custom-banner',
        'imageUrl', banner_image_url,
        'isActive', true,
        'displayOrder', 1
      ),
      jsonb_build_object(
        'id', 'banner-1',
        'imageUrl', '/banners/banner-1.png',
        'isActive', true,
        'displayOrder', 2
      ),
      jsonb_build_object(
        'id', 'banner-2',
        'imageUrl', '/banners/banner-2.png',
        'isActive', true,
        'displayOrder', 3
      ),
      jsonb_build_object(
        'id', 'banner-3',
        'imageUrl', '/banners/banner-3.png',
        'isActive', true,
        'displayOrder', 4
      )
    )
    else jsonb_build_array(
      jsonb_build_object(
        'id', 'banner-1',
        'imageUrl', '/banners/banner-1.png',
        'isActive', true,
        'displayOrder', 1
      ),
      jsonb_build_object(
        'id', 'banner-2',
        'imageUrl', '/banners/banner-2.png',
        'isActive', true,
        'displayOrder', 2
      ),
      jsonb_build_object(
        'id', 'banner-3',
        'imageUrl', '/banners/banner-3.png',
        'isActive', true,
        'displayOrder', 3
      )
    )
  end
where banner_slides is null;

alter table public.site_settings
  alter column banner_slides
  set default '[
    {
      "id": "banner-1",
      "imageUrl": "/banners/banner-1.png",
      "isActive": true,
      "displayOrder": 1
    },
    {
      "id": "banner-2",
      "imageUrl": "/banners/banner-2.png",
      "isActive": true,
      "displayOrder": 2
    },
    {
      "id": "banner-3",
      "imageUrl": "/banners/banner-3.png",
      "isActive": true,
      "displayOrder": 3
    }
  ]'::jsonb;

alter table public.site_settings
  alter column banner_slides set not null;

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
on public.site_settings
for select
using (true);

drop policy if exists "Only admin can insert site settings" on public.site_settings;
create policy "Only admin can insert site settings"
on public.site_settings
for insert
to authenticated
with check ((auth.jwt() ->> 'email') = 'murtaza.sanwala@admin.local');

drop policy if exists "Only admin can update site settings" on public.site_settings;
create policy "Only admin can update site settings"
on public.site_settings
for update
to authenticated
using ((auth.jwt() ->> 'email') = 'murtaza.sanwala@admin.local')
with check ((auth.jwt() ->> 'email') = 'murtaza.sanwala@admin.local');
