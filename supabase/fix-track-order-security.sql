-- Secure guest order tracking.
-- Requires:
--   1. Order number
--   2. Matching email address OR phone number
--
-- Returns only fields needed by the public tracking page.

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