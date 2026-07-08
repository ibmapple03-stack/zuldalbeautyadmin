-- Zuldal Beauty & Wellness — lets admins update an order's status (e.g. mark
-- as processing/shipped/delivered/cancelled) from the admin dashboard.
-- Run this once, after schema.sql, in the Supabase SQL Editor.

drop policy if exists "Admins update orders" on public.orders;
create policy "Admins update orders" on public.orders for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
