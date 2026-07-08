-- Zuldal Beauty & Wellness — lowers the "low stock" threshold from <=20 to
-- <5 units, so the dashboard only flags products that are actually close to
-- selling out.
-- Run this once, after 017_inventory_value_at_cost.sql, in the Supabase SQL
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
    count(*) filter (where p.stock > 0 and p.stock < 5)::bigint as low_stock,
    count(*) filter (where p.stock <= 0)::bigint as out_of_stock
  from public.products p;
end;
$$;

grant execute on function public.product_stats() to authenticated;
