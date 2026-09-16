-- HM Shop Online - Admin V2 Product Extension
-- Review before running in Supabase.
--
-- Adds lightweight ecommerce product-management fields without
-- introducing ERP-style inventory quantities.

alter table public.products
  add column if not exists sku text,
  add column if not exists brand text,
  add column if not exists status text not null default 'active',
  add column if not exists stock_status text not null default 'in_stock',
  add column if not exists search_keywords text[] not null default '{}';

-- Keep product publishing states predictable.
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


-- Customer-facing availability only.
-- Numerical inventory remains the responsibility of the ERP.
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


-- Permanent automatic SKU.
-- Case-insensitive uniqueness protects every assigned product code.
create unique index if not exists idx_products_sku_unique
  on public.products (lower(btrim(sku)))
  where sku is not null and btrim(sku) <> '';

create sequence if not exists public.product_sku_seq
  start with 1
  increment by 1
  minvalue 1;

create or replace function public.assign_product_sku()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.sku is null or btrim(new.sku) = '' then
    new.sku :=
      'HM-' ||
      lpad(nextval('public.product_sku_seq')::text, 6, '0');
  end if;

  return new;
end;
$$;

drop trigger if exists assign_product_sku_before_insert
on public.products;

create trigger assign_product_sku_before_insert
before insert on public.products
for each row
execute function public.assign_product_sku();


-- Useful for admin filters and storefront product listing.
create index if not exists idx_products_status_created_at
  on public.products (status, created_at desc);

create index if not exists idx_products_stock_status
  on public.products (stock_status);


-- Existing products remain ACTIVE automatically because of the default.
-- Existing products also remain IN STOCK automatically.


-- Public storefront:
-- customers should never receive draft products.
-- Drop both legacy and V2 policies so this migration is safe to rerun.
drop policy if exists "Public can read products" on public.products;
drop policy if exists "Public can read active products" on public.products;
drop policy if exists "Authenticated customers can read active products" on public.products;

create policy "Public can read active products"
on public.products
for select
to anon
using (status = 'active');


-- Logged-in customers may also browse active products.
create policy "Authenticated customers can read active products"
on public.products
for select
to authenticated
using (status = 'active');


-- Admin must be able to see Active AND Draft products.
drop policy if exists "Admin can read all products" on public.products;

create policy "Admin can read all products"
on public.products
for select
to authenticated
using (
  (auth.jwt() ->> 'email') = 'murtaza.sanwala@admin.local'
);