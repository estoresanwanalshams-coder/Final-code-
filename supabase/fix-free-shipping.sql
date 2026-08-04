-- Run in Supabase Dashboard > SQL Editor to enable Free Shipping on products.

alter table public.products
add column if not exists free_shipping boolean not null default false;

comment on column public.products.free_shipping is
  'When true, product is eligible for free shipping on the storefront.';
