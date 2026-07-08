-- Zuldal Beauty & Wellness — adds courier tracking fields and an internal
-- notes field to orders, so the admin dashboard can record how an order is
-- being shipped without exposing that detail to customers.
-- Run this once, after 003_admin_orders_update.sql, in the Supabase SQL Editor.

alter table public.orders add column if not exists tracking_number text;
alter table public.orders add column if not exists courier text;
alter table public.orders add column if not exists admin_notes text;
