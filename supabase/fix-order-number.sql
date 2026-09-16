-- HM Shop Online - Sequential Order Numbers
-- Format: ORD-HM-0001, ORD-HM-0002, ...
--
-- The sequence is never moved backwards. Deleted order numbers
-- are therefore never intentionally reused.

create sequence if not exists public.order_number_seq
  start with 1
  increment by 1
  minvalue 1;

-- Safely synchronize the sequence with existing orders.
-- Preserve a higher sequence value if orders were deleted.
do $$
declare
  max_order_num bigint;
  current_seq bigint;
  sequence_called boolean;
begin
  select
    last_value,
    is_called
  into
    current_seq,
    sequence_called
  from public.order_number_seq;

  select coalesce(
    max(
      substring(order_number from '^ORD-HM-([0-9]+)$')::bigint
    ),
    0
  )
  into max_order_num
  from public.orders
  where order_number ~ '^ORD-HM-[0-9]+$';

  if max_order_num > current_seq
   or (
     max_order_num = current_seq
     and max_order_num > 0
     and not sequence_called
   )
  then
  perform setval(
    'public.order_number_seq',
    max_order_num,
    true
  );
  end if;
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

  return
    'ORD-HM-' ||
    lpad(next_val::text, 4, '0');
end;
$$;

grant usage, select
on sequence public.order_number_seq
to anon, authenticated;

grant execute
on function public.next_order_number()
to anon, authenticated;
