-- Zuldal Beauty & Wellness — upgrades products from a single photo to a
-- gallery of photos. Replaces the `image_url` column (added in 004) with
-- `image_urls text[]`, carrying over any photo already uploaded.
-- Run this once, after 004_product_images.sql, in the Supabase SQL Editor.

alter table public.products add column if not exists image_urls text[] not null default '{}';

update public.products
set image_urls = array[image_url]
where image_url is not null
  and (image_urls is null or array_length(image_urls, 1) is null);

alter table public.products drop column if exists image_url;
