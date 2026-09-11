-- HM Shop Online - Admin V2 Category Extension
-- Adds lightweight ecommerce category management fields.

alter table public.categories
  add column if not exists image_url text,
  add column if not exists is_active boolean not null default true,
  add column if not exists display_order integer not null default 0;

create index if not exists idx_categories_active_display_order
  on public.categories (is_active, display_order, created_at);

drop policy if exists "Public can read categories"
  on public.categories;

drop policy if exists "Public can read active categories"
  on public.categories;

drop policy if exists "Authenticated customers can read active categories"
  on public.categories;

drop policy if exists "Admin can read all categories"
  on public.categories;

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