-- Zuldal Beauty & Wellness — defense-in-depth constraints. The admin
-- dashboard already validates these client-side, but an admin session token
-- talks directly to PostgREST, so bad values (or a buggy client) could
-- otherwise be written straight to the table. Also caps the product-images
-- bucket to actual images at a sane size, and caps support message length
-- against abuse from the public contact form.
-- Run this once, after 006_support_messages.sql, in the Supabase SQL Editor.
-- Note: this will fail if any existing row already violates a constraint
-- (e.g. a negative price) — fix that row first, then re-run.

alter table public.products drop constraint if exists products_price_nonnegative;
alter table public.products add constraint products_price_nonnegative check (price >= 0);

alter table public.products drop constraint if exists products_compare_at_price_nonnegative;
alter table public.products add constraint products_compare_at_price_nonnegative
  check (compare_at_price is null or compare_at_price >= 0);

alter table public.products drop constraint if exists products_stock_nonnegative;
alter table public.products add constraint products_stock_nonnegative check (stock >= 0);

alter table public.support_messages drop constraint if exists support_messages_length;
alter table public.support_messages add constraint support_messages_length
  check (char_length(message) <= 5000);

update storage.buckets
set file_size_limit = 5242880, -- 5MB
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
where id = 'product-images';
