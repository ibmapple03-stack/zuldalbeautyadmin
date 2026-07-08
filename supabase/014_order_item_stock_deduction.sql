-- Zuldal Beauty & Wellness — deducts stock automatically when a customer
-- checks out, so product stock (and the admin dashboard's low-stock/out-of-
-- stock stats) stay accurate without an admin manually adjusting it after
-- every sale. Also blocks overselling: if the requested quantity exceeds
-- current stock, the order_items insert (and therefore checkout) fails
-- instead of silently taking an order that can't be fulfilled.
--
-- Extends the enforce_order_item_integrity() trigger from
-- 013_order_item_integrity_trigger.sql (same trigger, same transaction) with
-- a `for update` row lock on the product row so two concurrent checkouts for
-- the last unit of a product can't both succeed.
--
-- Run this once, after 013_order_item_integrity_trigger.sql, in the Supabase
-- SQL Editor.

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
    select price, stock into v_price, v_stock
    from public.products
    where id = new.product_id
    for update;

    if v_price is not null then
      new.price := v_price;
    end if;

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
