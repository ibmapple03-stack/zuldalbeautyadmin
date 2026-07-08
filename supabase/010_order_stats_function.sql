-- Zuldal Beauty & Wellness — server-side aggregate for the admin dashboard's
-- order stat tiles (counts by status, revenue today/this month/all-time),
-- mirroring product_stats() from 002. Restricted to admins only.
-- Run this once, after 008_order_status_events.sql, in the Supabase SQL Editor.

create or replace function public.order_stats()
returns table (
  total_orders bigint,
  pending_orders bigint,
  processing_orders bigint,
  shipped_orders bigint,
  delivered_orders bigint,
  cancelled_orders bigint,
  revenue_today numeric,
  revenue_month numeric,
  revenue_total numeric
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
    count(*) as total_orders,
    count(*) filter (where o.status = 'pending') as pending_orders,
    count(*) filter (where o.status = 'processing') as processing_orders,
    count(*) filter (where o.status = 'shipped') as shipped_orders,
    count(*) filter (where o.status = 'delivered') as delivered_orders,
    count(*) filter (where o.status = 'cancelled') as cancelled_orders,
    coalesce(sum(o.total) filter (where o.created_at >= date_trunc('day', now())), 0)::numeric as revenue_today,
    coalesce(sum(o.total) filter (where o.created_at >= date_trunc('month', now())), 0)::numeric as revenue_month,
    coalesce(sum(o.total), 0)::numeric as revenue_total
  from public.orders o;
end;
$$;

grant execute on function public.order_stats() to authenticated;
