-- Run in Supabase SQL Editor for sequential order numbers: ORD-HM-0001, ORD-HM-0002, ...

create sequence if not exists public.order_number_seq
  start with 1
  increment by 1
  minvalue 1;

-- Sync sequence with existing ORD-HM-#### orders
do $$
declare
  max_num bigint;
begin
  select max(
    substring(order_number from 'ORD-HM-([0-9]+)')::bigint
  )
  into max_num
  from public.orders
  where order_number ~ '^ORD-HM-[0-9]+$';

  perform setval('public.order_number_seq', coalesce(max_num, 0), true);
end;
$$;

create or replace function public.next_order_number()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  next_val bigint;
begin
  next_val := nextval('public.order_number_seq');
  return 'ORD-HM-' || lpad(next_val::text, 4, '0');
end;
$$;

grant usage, select on sequence public.order_number_seq to anon, authenticated;
grant execute on function public.next_order_number() to anon, authenticated;
