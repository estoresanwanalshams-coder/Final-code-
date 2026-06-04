-- Run this entire file in Supabase SQL Editor.

create or replace function public.is_admin_email()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) in (
    lower('murtaza.sanwala@admin.local'),
    lower('murtaza.sanwala@admin.locals')
  );
$$;

-- Customer profile sync (runs after login/register when session exists)
create or replace function public.upsert_customer_profile(
  p_full_name text,
  p_email text,
  p_phone text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.customers (auth_user_id, full_name, email, phone)
  values (
    v_user_id,
    trim(coalesce(p_full_name, '')),
    lower(trim(coalesce(p_email, ''))),
    trim(coalesce(p_phone, ''))
  )
  on conflict (auth_user_id) do update
  set
    full_name = excluded.full_name,
    email = excluded.email,
    phone = excluded.phone,
    updated_at = now();
end;
$$;

grant execute on function public.upsert_customer_profile(text, text, text) to authenticated;

-- Admin: list all customers (bypasses RLS safely)
create or replace function public.admin_list_customers()
returns setof public.customers
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin_email() then
    raise exception 'Unauthorized';
  end if;

  return query
  select *
  from public.customers
  order by created_at desc;
end;
$$;

grant execute on function public.admin_list_customers() to authenticated;

-- Admin: backfill customers from Supabase Auth users
create or replace function public.admin_backfill_customers()
returns integer
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  inserted_count integer := 0;
begin
  if not public.is_admin_email() then
    raise exception 'Unauthorized';
  end if;

  insert into public.customers (auth_user_id, full_name, email, phone)
  select
    u.id,
    trim(coalesce(u.raw_user_meta_data ->> 'full_name', split_part(u.email, '@', 1), 'Customer')),
    lower(trim(u.email)),
    trim(coalesce(u.raw_user_meta_data ->> 'phone', ''))
  from auth.users u
  where u.email is not null
    and lower(u.email) not in (
      lower('murtaza.sanwala@admin.local'),
      lower('murtaza.sanwala@admin.locals')
    )
  on conflict (auth_user_id) do update
  set
    full_name = excluded.full_name,
    email = excluded.email,
    phone = coalesce(nullif(excluded.phone, ''), public.customers.phone),
    updated_at = now();

  get diagnostics inserted_count = row_count;
  return inserted_count;
end;
$$;

grant execute on function public.admin_backfill_customers() to authenticated;

-- Customers: admin full access
drop policy if exists "Only admin can read customers" on public.customers;
create policy "Only admin can read customers"
on public.customers
for select
to authenticated
using (public.is_admin_email());

drop policy if exists "Only admin can insert customers" on public.customers;
create policy "Only admin can insert customers"
on public.customers
for insert
to authenticated
with check (public.is_admin_email());

drop policy if exists "Only admin can delete customers" on public.customers;
create policy "Only admin can delete customers"
on public.customers
for delete
to authenticated
using (public.is_admin_email());

drop policy if exists "Only admin can update any customer" on public.customers;
create policy "Only admin can update any customer"
on public.customers
for update
to authenticated
using (public.is_admin_email())
with check (public.is_admin_email());

-- Orders: admin full access
drop policy if exists "Only admin can read orders" on public.orders;
create policy "Only admin can read orders"
on public.orders
for select
to authenticated
using (public.is_admin_email());

drop policy if exists "Only admin can update orders" on public.orders;
create policy "Only admin can update orders"
on public.orders
for update
to authenticated
using (public.is_admin_email())
with check (public.is_admin_email());

drop policy if exists "Only admin can delete orders" on public.orders;
create policy "Only admin can delete orders"
on public.orders
for delete
to authenticated
using (public.is_admin_email());
