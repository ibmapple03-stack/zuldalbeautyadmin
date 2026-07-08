-- Zuldal Beauty & Wellness — adds a server-side aggregate function so the
-- admin dashboard can show total products / inventory value / low stock /
-- out of stock counts without ever pulling the full products table to the
-- client. Restricted to admins only (inventory value is business-sensitive).
-- Run this once, after schema.sql, in the Supabase SQL Editor.

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
    count(*) as total_products,
    coalesce(sum(p.price * p.stock), 0)::numeric as inventory_value,
    count(*) filter (where p.stock > 0 and p.stock <= 20) as low_stock,
    count(*) filter (where p.stock <= 0) as out_of_stock
  from public.products p;
end;
$$;

grant execute on function public.product_stats() to authenticated;
