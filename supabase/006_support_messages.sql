-- Zuldal Beauty & Wellness — customer support/contact form. Stores
-- submissions for review directly in the Supabase Table Editor (there's no
-- admin dashboard app in this project, so this table is the inbox).
-- Run this once, after schema.sql, in the Supabase SQL Editor.

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.support_messages enable row level security;

drop policy if exists "Anyone can submit support messages" on public.support_messages;
create policy "Anyone can submit support messages" on public.support_messages
for insert with check (true);
