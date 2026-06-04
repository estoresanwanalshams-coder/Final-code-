-- Run this in Supabase Dashboard > SQL Editor.
-- Admin email used by the app:
-- murtaza.sanwala@admin.local

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  category_slug text not null,
  actual_price numeric,
  price numeric not null check (price >= 0),
  summary text not null,
  details text not null,
  image_url text not null,
  image_urls text[] not null default '{}',
  video_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  is_main boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_product_images_product_id_sort_order
  on public.product_images (product_id, sort_order);

create unique index if not exists idx_product_images_main_per_product
  on public.product_images (product_id)
  where is_main = true;

alter table public.products
add column if not exists actual_price numeric;

alter table public.products
add column if not exists image_urls text[] not null default '{}';

alter table public.products
add column if not exists video_url text;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.categories (name, slug, description)
values
  ('Home and Kitchen', 'home-and-kitchen', 'Useful kitchen tools, dining basics, storage, and home essentials.'),
  ('Electronic Gadgets', 'electronic-gadgets', 'Smart accessories, compact tech, chargers, and everyday gadgets.'),
  ('Baby & Toys', 'baby-toys', 'Baby care items, playful toys, learning products, and gifting picks.'),
  ('Automative', 'automative', 'Car accessories, maintenance helpers, organizers, and travel tools.'),
  ('Health & Beauty', 'health-beauty', 'Self-care, grooming, beauty tools, and wellness essentials.')
on conflict (slug) do nothing;

alter table public.products enable row level security;
alter table public.product_images enable row level security;
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

drop policy if exists "Public can read products" on public.products;
create policy "Public can read products"
on public.products
for select
using (true);

drop policy if exists "Only admin can insert products" on public.products;
create policy "Only admin can insert products"
on public.products
for insert
to authenticated
with check ((auth.jwt() ->> 'email') = 'murtaza.sanwala@admin.local');

drop policy if exists "Only admin can update products" on public.products;
create policy "Only admin can update products"
on public.products
for update
to authenticated
using ((auth.jwt() ->> 'email') = 'murtaza.sanwala@admin.local')
with check ((auth.jwt() ->> 'email') = 'murtaza.sanwala@admin.local');

drop policy if exists "Only admin can delete products" on public.products;
create policy "Only admin can delete products"
on public.products
for delete
to authenticated
using ((auth.jwt() ->> 'email') = 'murtaza.sanwala@admin.local');

drop policy if exists "Public can read product images" on public.product_images;
create policy "Public can read product images"
on public.product_images
for select
using (true);

drop policy if exists "Only admin can insert product images" on public.product_images;
create policy "Only admin can insert product images"
on public.product_images
for insert
to authenticated
with check ((auth.jwt() ->> 'email') = 'murtaza.sanwala@admin.local');

drop policy if exists "Only admin can update product images" on public.product_images;
create policy "Only admin can update product images"
on public.product_images
for update
to authenticated
using ((auth.jwt() ->> 'email') = 'murtaza.sanwala@admin.local')
with check ((auth.jwt() ->> 'email') = 'murtaza.sanwala@admin.local');

drop policy if exists "Only admin can delete product images" on public.product_images;
create policy "Only admin can delete product images"
on public.product_images
for delete
to authenticated
using ((auth.jwt() ->> 'email') = 'murtaza.sanwala@admin.local');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

drop trigger if exists set_product_images_updated_at on public.product_images;
create trigger set_product_images_updated_at
before update on public.product_images
for each row
execute function public.set_updated_at();

drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at
before update on public.categories
for each row
execute function public.set_updated_at();

create table if not exists public.site_settings (
  id text primary key default 'main',
  offer_text text not null default 'Free shipping on orders over Rs. 999 | New season offers are live',
  banner_image_url text not null default 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80',
  shipping_charge numeric not null default 40 check (shipping_charge >= 0),
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

drop trigger if exists set_site_settings_updated_at on public.site_settings;
create trigger set_site_settings_updated_at
before update on public.site_settings
for each row
execute function public.set_updated_at();

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  full_name text not null,
  email text not null,
  phone text not null,
  address_line_1 text not null,
  address_line_2 text,
  city text not null,
  shipping_method text not null default 'Standard Shipping',
  additional_notes text not null default '',
  items jsonb not null,
  total numeric not null default 0,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders
add column if not exists shipping_method text not null default 'Standard Shipping';

alter table public.orders
add column if not exists additional_notes text not null default '';

create index if not exists idx_orders_email_created_at
  on public.orders (email, created_at desc);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  full_name text not null,
  email text not null,
  phone text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;
alter table public.customers enable row level security;

drop policy if exists "Public can create orders" on public.orders;
create policy "Public can create orders"
on public.orders
for insert
to public
with check (true);

drop policy if exists "Only admin can read orders" on public.orders;
create policy "Only admin can read orders"
on public.orders
for select
to authenticated
using ((auth.jwt() ->> 'email') = 'murtaza.sanwala@admin.local');

drop policy if exists "Customers can read own orders" on public.orders;
create policy "Customers can read own orders"
on public.orders
for select
to authenticated
using (lower(email) = lower(auth.jwt() ->> 'email'));

-- Guest order tracking: a security-definer function so guests (anon role)
-- can look up ONLY orders they already know the identifier for, without
-- exposing a blanket SELECT on the orders table.
create or replace function public.track_order(p_identifier text)
returns setof public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id text := trim(coalesce(p_identifier, ''));
  v_digits text := regexp_replace(coalesce(p_identifier, ''), '\D', '', 'g');
begin
  return query
  select *
  from public.orders o
  where lower(o.email) = lower(v_id)
     or o.order_number = v_id
     or (length(v_digits) >= 6 and regexp_replace(o.phone, '\D', '', 'g') = v_digits)
  order by o.created_at desc
  limit 20;
end;
$$;

grant execute on function public.track_order(text) to anon, authenticated;

drop policy if exists "Only admin can update orders" on public.orders;
create policy "Only admin can update orders"
on public.orders
for update
to authenticated
using ((auth.jwt() ->> 'email') = 'murtaza.sanwala@admin.local')
with check ((auth.jwt() ->> 'email') = 'murtaza.sanwala@admin.local');

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

drop trigger if exists set_customers_updated_at on public.customers;
create trigger set_customers_updated_at
before update on public.customers
for each row
execute function public.set_updated_at();

drop policy if exists "Authenticated can upsert own customer profile" on public.customers;
create policy "Authenticated can upsert own customer profile"
on public.customers
for insert
to authenticated
with check (auth.uid() = auth_user_id);

drop policy if exists "Authenticated can update own customer profile" on public.customers;
create policy "Authenticated can update own customer profile"
on public.customers
for update
to authenticated
using (auth.uid() = auth_user_id)
with check (auth.uid() = auth_user_id);

drop policy if exists "Only admin can read customers" on public.customers;
create policy "Only admin can read customers"
on public.customers
for select
to authenticated
using ((auth.jwt() ->> 'email') = 'murtaza.sanwala@admin.local');

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Public can read product images" on storage.objects;
create policy "Public can read product images"
on storage.objects
for select
using (bucket_id = 'product-images');

drop policy if exists "Only admin can upload product images" on storage.objects;
create policy "Only admin can upload product images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and (auth.jwt() ->> 'email') = 'murtaza.sanwala@admin.local'
);
