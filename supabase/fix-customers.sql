-- Run in Supabase SQL editor to enable customer profile storage.

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  full_name text not null,
  email text not null,
  phone text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.customers enable row level security;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

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
