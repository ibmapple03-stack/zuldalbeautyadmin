-- Zuldal Beauty & Wellness — adds real product photo support: an
-- `image_url` column on products, plus a public storage bucket admins can
-- upload to from the "Add Product" / "Edit Product" forms.
-- Run this once, after schema.sql (and 002/003), in the Supabase SQL Editor.

alter table public.products add column if not exists image_url text;

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images" on storage.objects for select
using (bucket_id = 'product-images');

drop policy if exists "Admins upload product images" on storage.objects;
create policy "Admins upload product images" on storage.objects for insert
with check (
  bucket_id = 'product-images'
  and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

drop policy if exists "Admins update product images" on storage.objects;
create policy "Admins update product images" on storage.objects for update
using (
  bucket_id = 'product-images'
  and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

drop policy if exists "Admins delete product images" on storage.objects;
create policy "Admins delete product images" on storage.objects for delete
using (
  bucket_id = 'product-images'
  and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
