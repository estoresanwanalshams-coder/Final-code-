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
