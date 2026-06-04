-- Product performance indexes for faster listing, filtering, and search

create extension if not exists pg_trgm;

create index if not exists idx_products_slug
  on public.products (slug);

create index if not exists idx_products_category_created_at
  on public.products (category_slug, created_at desc);

create index if not exists idx_products_created_at
  on public.products (created_at desc);

create index if not exists idx_products_name_trgm
  on public.products using gin (name gin_trgm_ops);
