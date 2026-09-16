-- HM Shop Online - Automatic Product SKU
-- Format: HM-000001, HM-000002, ...
--
-- Existing products are renumbered by original creation order.
-- Future products receive the next SKU automatically.
-- Existing SKUs remain unchanged during normal product updates.

create sequence if not exists public.product_sku_seq
  start with 1
  increment by 1
  minvalue 1;

-- Backfill and standardize every existing product.
with numbered_products as (
  select
    id,
    row_number() over (
      order by created_at asc, id asc
    ) as sku_number
  from public.products
)
update public.products p
set sku = 'HM-' || lpad(n.sku_number::text, 6, '0')
from numbered_products n
where p.id = n.id;

-- Move the sequence beyond the highest SKU assigned above.
select setval(
  'public.product_sku_seq',
  greatest(
    coalesce(
      (
        select max(
          substring(sku from '^HM-([0-9]+)$')::bigint
        )
        from public.products
        where sku ~ '^HM-[0-9]+$'
      ),
      0
    ),
    1
  ),
  true
);

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

alter table public.products
  alter column sku set not null;