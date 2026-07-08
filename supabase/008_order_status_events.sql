-- Zuldal Beauty & Wellness — records every order status change so the admin
-- dashboard can show a tracking timeline (pending -> processing -> shipped ->
-- delivered), each with an optional note from the admin who made the change.
-- Run this once, after 007_orders_tracking_fields.sql, in the Supabase SQL Editor.

create table if not exists public.order_status_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null,
  note text,
  created_at timestamptz not null default now()
);

alter table public.order_status_events enable row level security;

drop policy if exists "Admins read order status events" on public.order_status_events;
create policy "Admins read order status events" on public.order_status_events for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

drop policy if exists "Admins insert order status events" on public.order_status_events;
create policy "Admins insert order status events" on public.order_status_events for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Backfill a starting event for orders placed before this table existed, so
-- every order's tracking timeline has at least one entry.
insert into public.order_status_events (order_id, status, note, created_at)
select o.id, o.status, 'Order placed', o.created_at
from public.orders o
where not exists (
  select 1 from public.order_status_events e where e.order_id = o.id
);
