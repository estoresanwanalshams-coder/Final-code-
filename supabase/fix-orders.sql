-- Run in Supabase Dashboard > SQL Editor if order placement fails.

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
  items jsonb not null default '[]'::jsonb,
  total numeric not null check (total >= 0),
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

alter table public.orders enable row level security;

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

drop policy if exists "Only admin can update orders" on public.orders;
create policy "Only admin can update orders"
on public.orders
for update
to authenticated
using ((auth.jwt() ->> 'email') = 'murtaza.sanwala@admin.local')
with check ((auth.jwt() ->> 'email') = 'murtaza.sanwala@admin.local');

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
