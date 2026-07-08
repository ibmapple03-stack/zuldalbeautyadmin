-- Zuldal Beauty & Wellness — adds payment tracking to orders so the admin
-- dashboard can tell whether a card payment actually went through (via
-- Paystack) before an order gets confirmed, separate from the order's
-- fulfillment status (pending/processing/shipped/delivered/cancelled).
--
-- 'unpaid' is the default for every new order — bank transfer and pay-on-
-- delivery orders stay 'unpaid' until an admin manually marks them paid
-- (nothing verifies those automatically); card orders get flipped to 'paid'
-- or 'failed' by the storefront's Paystack verification route.
--
-- Run this once, after 018_low_stock_threshold.sql, in the Supabase SQL
-- Editor.

alter table public.orders add column if not exists payment_status text not null default 'unpaid';
alter table public.orders drop constraint if exists orders_payment_status_check;
alter table public.orders add constraint orders_payment_status_check
  check (payment_status in ('unpaid', 'paid', 'failed'));

alter table public.orders add column if not exists payment_reference text;
