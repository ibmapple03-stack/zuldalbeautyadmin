-- Zuldal Beauty & Wellness — atomically updates an order's status and
-- records the matching tracking-history event in one transaction, so a
-- network hiccup between the two writes can never leave the order's status
-- changed without a corresponding entry in its tracking timeline.
-- Run this once, after 010_order_stats_function.sql, in the Supabase SQL Editor.

create or replace function public.update_order_status(p_order_id uuid, p_status text, p_note text default null)
returns void
language plpgsql
as $$
begin
  if not exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ) then
    raise exception 'insufficient_privilege' using errcode = '42501';
  end if;

  update public.orders set status = p_status where id = p_order_id;

  if not found then
    raise exception 'order_not_found' using errcode = 'P0002';
  end if;

  insert into public.order_status_events (order_id, status, note)
  values (p_order_id, p_status, nullif(trim(p_note), ''));
end;
$$;

grant execute on function public.update_order_status(uuid, text, text) to authenticated;
