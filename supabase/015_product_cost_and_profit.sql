-- Zuldal Beauty & Wellness — adds a per-product cost price so the admin
-- dashboard can report profit (not just revenue). The cost is snapshotted
-- onto order_items at checkout time (same pattern as price, via the
-- enforce_order_item_integrity trigger from 013/014) so profit on a past
-- order stays accurate even if a product's cost changes later. order_stats()
-- is extended with profit_today/profit_month/profit_total, counting only
-- orders that have actually reached "delivered" — using the timestamp of
-- that status's entry in order_status_events, not the order's original
-- placement date.
-- Run this once, after 014_order_item_stock_deduction.sql, in the Supabase
-- SQL Editor.

alter table public.products add column if not exists cost_price integer;
alter table public.products drop constraint if exists products_cost_price_nonnegative;
alter table public.products add constraint products_cost_price_nonnegative
  check (cost_price is null or cost_price >= 0);

alter table public.order_items add column if not exists cost_price integer;

create or replace function public.enforce_order_item_integrity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
  v_created_at timestamptz;
  v_price integer;
  v_stock integer;
  v_cost_price integer;
begin
  select status, created_at into v_status, v_created_at
  from public.orders
  where id = new.order_id;

  if v_status is null then
    raise exception 'order_not_found' using errcode = 'P0002';
  end if;

  if v_status <> 'pending' or v_created_at < now() - interval '30 minutes' then
    raise exception 'order_not_open_for_items' using errcode = '42501';
  end if;

  if new.product_id is not null then
    select price, stock, cost_price into v_price, v_stock, v_cost_price
    from public.products
    where id = new.product_id
    for update;

    if v_price is not null then
      new.price := v_price;
    end if;

    new.cost_price := v_cost_price;

    if v_stock is not null then
      if v_stock < new.quantity then
        raise exception 'insufficient_stock' using errcode = '23514';
      end if;

      update public.products set stock = stock - new.quantity where id = new.product_id;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_order_item_integrity on public.order_items;
create trigger enforce_order_item_integrity
before insert on public.order_items
for each row execute function public.enforce_order_item_integrity();

-- order_stats() is gaining new output columns (profit_today/month/total).
-- Postgres won't let CREATE OR REPLACE change a function's return columns,
-- so the old signature has to be dropped first.
drop function if exists public.order_stats();

create function public.order_stats()
returns table (
  total_orders bigint,
  pending_orders bigint,
  processing_orders bigint,
  shipped_orders bigint,
  delivered_orders bigint,
  cancelled_orders bigint,
  revenue_today numeric,
  revenue_month numeric,
  revenue_total numeric,
  profit_today numeric,
  profit_month numeric,
  profit_total numeric
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
  with order_totals as (
    select
      count(*) as total_orders,
      count(*) filter (where o.status = 'pending') as pending_orders,
      count(*) filter (where o.status = 'processing') as processing_orders,
      count(*) filter (where o.status = 'shipped') as shipped_orders,
      count(*) filter (where o.status = 'delivered') as delivered_orders,
      count(*) filter (where o.status = 'cancelled') as cancelled_orders,
      coalesce(sum(o.total) filter (where o.created_at >= date_trunc('day', now())), 0)::numeric as revenue_today,
      coalesce(sum(o.total) filter (where o.created_at >= date_trunc('month', now())), 0)::numeric as revenue_month,
      coalesce(sum(o.total), 0)::numeric as revenue_total
    from public.orders o
  ),
  completed_orders as (
    select o.id as order_id, ev.completed_at
    from public.orders o
    join lateral (
      select max(e.created_at) as completed_at
      from public.order_status_events e
      where e.order_id = o.id and e.status = 'delivered'
    ) ev on true
    where o.status = 'delivered'
  ),
  profit_by_order as (
    select
      c.completed_at,
      sum((oi.price - coalesce(oi.cost_price, oi.price)) * oi.quantity) as profit
    from completed_orders c
    join public.order_items oi on oi.order_id = c.order_id
    group by c.completed_at
  ),
  profit_totals as (
    select
      coalesce(sum(profit) filter (where completed_at >= date_trunc('day', now())), 0)::numeric as profit_today,
      coalesce(sum(profit) filter (where completed_at >= date_trunc('month', now())), 0)::numeric as profit_month,
      coalesce(sum(profit), 0)::numeric as profit_total
    from profit_by_order
  )
  select
    order_totals.total_orders,
    order_totals.pending_orders,
    order_totals.processing_orders,
    order_totals.shipped_orders,
    order_totals.delivered_orders,
    order_totals.cancelled_orders,
    order_totals.revenue_today,
    order_totals.revenue_month,
    order_totals.revenue_total,
    profit_totals.profit_today,
    profit_totals.profit_month,
    profit_totals.profit_total
  from order_totals, profit_totals;
end;
$$;

grant execute on function public.order_stats() to authenticated;
