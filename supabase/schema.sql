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
  free_shipping boolean not null default false,
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

alter table public.products
add column if not exists free_shipping boolean not null default false;

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

-- Secure guest order tracking.
-- Requires an order number plus the matching email address or phone number.
-- Returns only the non-sensitive fields needed by the public tracking page.
create or replace function public.track_order(
  p_order_number text,
  p_identifier text
)
returns table (
  order_number text,
  items jsonb,
  total numeric,
  status text,
  created_at timestamptz,
  shipping_method text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_number text := trim(coalesce(p_order_number, ''));
  v_identifier text := trim(coalesce(p_identifier, ''));
  v_digits text := regexp_replace(coalesce(p_identifier, ''), '\D', '', 'g');
begin
  if v_order_number = '' or v_identifier = '' then
    return;
  end if;

  return query
  select
    o.order_number::text,
    o.items::jsonb,
    o.total::numeric,
    o.status::text,
    o.created_at::timestamptz,
    coalesce(o.shipping_method, 'Standard Shipping')::text
  from public.orders o
  where lower(o.order_number) = lower(v_order_number)
    and (
      lower(o.email) = lower(v_identifier)
      or (
        length(v_digits) >= 6
        and regexp_replace(o.phone, '\D', '', 'g') = v_digits
      )
    )
  order by o.created_at desc
  limit 1;
end;
$$;

revoke all on function public.track_order(text, text) from public;
grant execute on function public.track_order(text, text) to anon, authenticated;

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

drop policy if exists "Customers can read own profile" on public.customers;
create policy "Customers can read own profile"
on public.customers
for select
to authenticated
using (auth.uid() = auth_user_id);

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

-- ============================================================
-- HM SHOP ONLINE - ADMIN V2 SCHEMA RECONCILIATION
-- Keep this section last so legacy bootstrap definitions above
-- are upgraded to the current storefront/admin requirements.
-- ============================================================


-- ------------------------------------------------------------
-- PRODUCTS V2
-- ------------------------------------------------------------

alter table public.products
  add column if not exists sku text,
  add column if not exists brand text,
  add column if not exists status text not null default 'active',
  add column if not exists stock_status text not null default 'in_stock',
  add column if not exists search_keywords text[] not null default '{}';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_status_check'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_status_check
      check (status in ('active', 'draft'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_stock_status_check'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_stock_status_check
      check (stock_status in ('in_stock', 'out_of_stock'));
  end if;
end $$;

create unique index if not exists idx_products_sku_unique
  on public.products (lower(btrim(sku)))
  where sku is not null and btrim(sku) <> '';

create index if not exists idx_products_status_created_at
  on public.products (status, created_at desc);

create index if not exists idx_products_stock_status
  on public.products (stock_status);

drop policy if exists "Public can read products" on public.products;
drop policy if exists "Public can read active products" on public.products;
drop policy if exists "Authenticated customers can read active products" on public.products;
drop policy if exists "Admin can read all products" on public.products;

create policy "Public can read active products"
on public.products
for select
to anon
using (status = 'active');

create policy "Authenticated customers can read active products"
on public.products
for select
to authenticated
using (status = 'active');

create policy "Admin can read all products"
on public.products
for select
to authenticated
using (
  (auth.jwt() ->> 'email') = 'murtaza.sanwala@admin.local'
);


-- ------------------------------------------------------------
-- CATEGORIES V2
-- ------------------------------------------------------------

alter table public.categories
  add column if not exists image_url text,
  add column if not exists is_active boolean not null default true,
  add column if not exists display_order integer not null default 0;

create index if not exists idx_categories_active_display_order
  on public.categories (is_active, display_order, created_at);

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

-- Keep the legacy slug for compatibility, but use the correct display name.
update public.categories
set name = 'Automotive'
where slug = 'automative';

insert into public.categories (name, slug, description)
values (
  'Tools & Home Improvement',
  'tools-home-improvement',
  'Tools, repair accessories, hardware, and practical home improvement products.'
)
on conflict (slug) do nothing;


-- ------------------------------------------------------------
-- HOMEPAGE V2
-- ------------------------------------------------------------

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


-- ------------------------------------------------------------
-- ORDER TRACKING SECURITY
-- ------------------------------------------------------------

-- Ensure an older one-argument tracking RPC can never remain available
-- if this schema is run against an existing database.
drop function if exists public.track_order(text);