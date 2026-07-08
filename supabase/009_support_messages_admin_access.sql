-- Zuldal Beauty & Wellness — lets admins actually read and triage the
-- support inbox from the dashboard (006 only allowed public inserts) and
-- adds a read/unread flag.
-- Run this once, after 006_support_messages.sql, in the Supabase SQL Editor.

alter table public.support_messages add column if not exists is_read boolean not null default false;

drop policy if exists "Admins read support messages" on public.support_messages;
create policy "Admins read support messages" on public.support_messages for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

drop policy if exists "Admins update support messages" on public.support_messages;
create policy "Admins update support messages" on public.support_messages for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
