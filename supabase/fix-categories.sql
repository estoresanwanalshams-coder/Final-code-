-- Run in Supabase Dashboard > SQL Editor if category save fails.
-- Ensures the categories table matches what the app expects.

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.categories
add column if not exists description text not null default '';

alter table public.categories
add column if not exists created_at timestamptz not null default now();

alter table public.categories
add column if not exists updated_at timestamptz not null default now();

alter table public.categories
add column if not exists image_url text;

alter table public.categories
add column if not exists is_active boolean not null default true;

alter table public.categories
add column if not exists display_order integer not null default 0;

create index if not exists idx_categories_active_display_order
  on public.categories (is_active, display_order, created_at);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'categories_slug_key'
      and conrelid = 'public.categories'::regclass
  ) then
    alter table public.categories add constraint categories_slug_key unique (slug);
  end if;
end $$;

alter table public.categories enable row level security;

drop policy if exists "Public can read categories" on public.categories;
drop policy if exists "Public can read active categories" on public.categories;
drop policy if exists "Authenticated customers can read active categories" on public.categories;
drop policy if exists "Admin can read all categories" on public.categories;

create policy "Public can read active categories"
on public.categories
for select
to anon
using (is_active = true);

create policy "Authenticated customers can read active categories"
on public.categories
for select
to authenticated
using (is_active = true);

create policy "Admin can read all categories"
on public.categories
for select
to authenticated
using (
  (auth.jwt() ->> 'email') = 'murtaza.sanwala@admin.local'
);

drop policy if exists "Only admin can insert categories" on public.categories;
create policy "Only admin can insert categories"
on public.categories
for insert
to authenticated
with check ((auth.jwt() ->> 'email') = 'murtaza.sanwala@admin.local');

drop policy if exists "Only admin can update categories" on public.categories;
create policy "Only admin can update categories"
on public.categories
for update
to authenticated
using ((auth.jwt() ->> 'email') = 'murtaza.sanwala@admin.local')
with check ((auth.jwt() ->> 'email') = 'murtaza.sanwala@admin.local');

drop policy if exists "Only admin can delete categories" on public.categories;
create policy "Only admin can delete categories"
on public.categories
for delete
to authenticated
using ((auth.jwt() ->> 'email') = 'murtaza.sanwala@admin.local');
