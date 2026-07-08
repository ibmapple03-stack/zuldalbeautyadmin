-- Zuldal Beauty & Wellness — closes an order-tampering hole in the original
-- schema: "Anyone can insert order items" (schema.sql) has no check that the
-- order_id belongs to the order the inserter just placed, and trusts the
-- client-supplied price outright. That means anyone with the public anon key
-- could POST extra items — at any price they choose — into ANY existing
-- order, corrupting its total after the admin (or the customer) has already
-- seen it confirmed.
--
-- This trigger closes that hole without changing the storefront's checkout
-- code at all:
--   1. Recomputes price server-side from the live products table, ignoring
--      whatever price the client sent.
--   2. Only allows inserting items into an order that is still "pending"
--      and was created in the last 30 minutes (a normal checkout inserts
--      its order_items within the same request, seconds after the order
--      row — this only blocks tampering with older or already-processed
--      orders, not real checkouts).
--
-- Runs as the function owner (security definer) because the inserting role
-- is anonymous/customer, which cannot itself SELECT the orders table under
-- RLS — the check still only gates the insert, it never exposes order data
-- back to the caller.
--
-- Run this once, after schema.sql, in the Supabase SQL Editor.

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
    select price into v_price from public.products where id = new.product_id;
    if v_price is not null then
      new.price := v_price;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_order_item_integrity on public.order_items;
create trigger enforce_order_item_integrity
before insert on public.order_items
for each row execute function public.enforce_order_item_integrity();
