-- Zuldal Beauty & Wellness — fixes "structure of query does not match
-- function result type" from product_stats() (002_product_stats_function.sql),
-- which was making the dashboard's Total Products / Inventory Value / Low
-- Stock / Out of Stock tiles silently fall back to 0 on every load.
--
-- price and stock are both `integer`; `sum(integer * integer)` returns
-- `bigint` in Postgres, and the previous version relied on the final
-- `::numeric` cast on the whole coalesce(...) expression to line it up with
-- the declared `inventory_value numeric` column. That should be equivalent,
-- but this version casts every returned column explicitly so there's no
-- ambiguity for Postgres to get wrong.
--
-- Run this once, after 002_product_stats_function.sql, in the Supabase SQL
-- Editor.

create or replace function public.product_stats()
returns table (
  total_products bigint,
  inventory_value numeric,
  low_stock bigint,
  out_of_stock bigint
)
language plpgsql
stable
as $$
begin
  if not exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ) then
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;

  return query
  select
    count(*)::bigint as total_products,
    coalesce(sum(p.price::numeric * p.stock::numeric), 0)::numeric as inventory_value,
    count(*) filter (where p.stock > 0 and p.stock <= 20)::bigint as low_stock,
    count(*) filter (where p.stock <= 0)::bigint as out_of_stock
  from public.products p;
end;
$$;

grant execute on function public.product_stats() to authenticated;
