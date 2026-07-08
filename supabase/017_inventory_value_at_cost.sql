-- Zuldal Beauty & Wellness — switches "Inventory Value" on the dashboard
-- from retail value (price × stock) to cost value (cost_price × stock) —
-- i.e. how much capital is actually tied up in stock, not what it would
-- sell for. Products with no cost price set yet contribute 0 rather than
-- falling back to their retail price, so the total doesn't overstate real
-- cost until you fill it in.
-- Run this once, after 016_fix_product_stats_types.sql, in the Supabase SQL
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
    coalesce(sum(coalesce(p.cost_price, 0)::numeric * p.stock::numeric), 0)::numeric as inventory_value,
    count(*) filter (where p.stock > 0 and p.stock <= 20)::bigint as low_stock,
    count(*) filter (where p.stock <= 0)::bigint as out_of_stock
  from public.products p;
end;
$$;

grant execute on function public.product_stats() to authenticated;
