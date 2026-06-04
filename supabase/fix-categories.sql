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
create policy "Public can read categories"
on public.categories
for select
using (true);

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
