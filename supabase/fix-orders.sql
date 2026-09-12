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

-- Secure guest order tracking.
-- Requires the order number plus matching email address or phone number.
-- Returns only fields required by the public tracking page.

drop function if exists public.track_order(text);

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
