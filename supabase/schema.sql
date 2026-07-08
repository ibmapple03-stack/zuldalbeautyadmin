-- Zuldal Beauty & Wellness — Supabase schema, RLS policies, and seed data.
-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query).

create extension if not exists pgcrypto;

-- ---------- Tables ----------

create table if not exists public.products (
  id text primary key,
  name text not null,
  brand text not null,
  category text not null check (category in ('women','men','wellness','perfumes','turaren-wuta')),
  price integer not null,
  compare_at_price integer,
  short_description text not null,
  description text not null,
  tags text[] not null default '{}',
  icon text not null,
  stock integer not null default 0,
  rating numeric(2,1) not null default 4.5,
  reviews_count integer not null default 0,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  email text not null,
  phone text not null,
  address text not null,
  city text not null,
  state text not null,
  payment_method text not null,
  subtotal integer not null,
  shipping integer not null,
  total integer not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text references public.products(id) on delete set null,
  product_name text not null,
  price integer not null,
  quantity integer not null
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'customer' check (role in ('admin','customer')),
  full_name text
);

-- ---------- Row Level Security ----------

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.profiles enable row level security;

-- Products: anyone can browse; only admins can write
drop policy if exists "Public read products" on public.products;
create policy "Public read products" on public.products for select using (true);

drop policy if exists "Admins insert products" on public.products;
create policy "Admins insert products" on public.products for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

drop policy if exists "Admins update products" on public.products;
create policy "Admins update products" on public.products for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
) with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

drop policy if exists "Admins delete products" on public.products;
create policy "Admins delete products" on public.products for delete using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Orders / order_items: anyone can place an order (guest checkout); only admins can read
drop policy if exists "Anyone can place orders" on public.orders;
create policy "Anyone can place orders" on public.orders for insert with check (true);

drop policy if exists "Admins read orders" on public.orders;
create policy "Admins read orders" on public.orders for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

drop policy if exists "Anyone can insert order items" on public.order_items;
create policy "Anyone can insert order items" on public.order_items for insert with check (true);

drop policy if exists "Admins read order items" on public.order_items;
create policy "Admins read order items" on public.order_items for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Profiles: a user can always read their own row (needed for the admin checks above)
drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles for select using (auth.uid() = id);

-- ---------- Seed data (the 22 launch products) ----------

insert into public.products (id, name, brand, category, price, compare_at_price, short_description, description, tags, icon, stock, rating, reviews_count, featured, created_at) values
('w-001','Radiant Shea Glow Body Butter','Zuldal Naturals','women',8500,10500,'Whipped shea butter for deep hydration and glow.','A rich, whipped body butter made from unrefined shea, sweet almond oil and vitamin E. Melts into skin instantly, leaving a soft, radiant glow without any greasy residue. Suitable for all skin types.',array['Hydrating','Natural','All Skin Types'],'jar',34,4.8,212,true,'2026-05-02'),
('w-002','Vitamin C Brightening Serum','Lumière Skin','women',12000,null,'20% Vitamin C serum for an even, brighter tone.','A fast-absorbing serum formulated with 20% stabilized Vitamin C, hyaluronic acid and licorice root extract to fade dark spots, even skin tone and boost radiance over time.',array['Brightening','Hydrating','Cruelty Free'],'droplet',51,4.7,168,true,'2026-04-18'),
('w-003','Silk Edge Laminating Brow Gel','Bloom Cosmetics','women',6200,null,'All-day brow hold with a soft, brushed-up finish.','A clear, flexible-hold gel that laminates and sets brows in place for up to 16 hours. Infused with castor oil to condition brow hairs while you wear it.',array['Long Wear','Cruelty Free'],'sparkles',60,4.5,94,false,'2026-03-30'),
('w-004','Black Soap Detox Cleansing Bar','Zuldal Naturals','women',4200,null,'African black soap for a deep, gentle cleanse.','Handmade with raw African black soap, shea butter and honey. Draws out impurities and excess oil while leaving skin soft and calm — safe for daily use on face and body.',array['Natural','Safe','All Skin Types'],'jar',78,4.6,143,false,'2026-02-14'),
('w-005','Silk Wrap Edge Control & Hair Gel','Crown & Coil','women',5000,null,'Strong hold edge control for sleek styles.','A non-flaking edge control that lays hair down smoothly and holds through humidity. Formulated with castor oil and aloe to nourish the scalp.',array['Long Wear','Natural'],'droplet',45,4.4,77,false,'2026-01-22'),
('m-001','Charcoal Deep Clean Face Wash','Zuldal Men','men',5800,null,'Activated charcoal face wash for oily skin.','Purifies pores and controls oil with activated charcoal and tea tree oil, without stripping skin. Leaves a fresh, matte finish — ideal for daily grooming routines.',array['Safe','All Skin Types'],'droplet',58,4.6,121,true,'2026-05-10'),
('m-002','Beard Growth & Conditioning Oil','Zuldal Men','men',7200,null,'Lightweight oil for a fuller, softer beard.','A blend of jojoba, argan and castor oils that softens coarse beard hair, soothes the skin underneath and supports healthier growth over time.',array['Natural','Hydrating'],'jar',40,4.7,156,false,'2026-04-02'),
('m-003','Energizing Body Wash for Men','Terra Grooming','men',4600,null,'Menthol-infused wash for an energizing shower.','A cooling body wash with mint, eucalyptus and sea salt extract that leaves skin refreshed and lightly scented all day long.',array['Safe','Hydrating'],'droplet',66,4.3,58,false,'2026-03-11'),
('m-004','Matte Finish Daily Moisturizer','Zuldal Men','men',6400,null,'Oil-free hydration with a shine-free finish.','A lightweight, fast-absorbing moisturizer with SPF-friendly base and niacinamide to hydrate skin while keeping shine under control all day.',array['Hydrating','All Skin Types'],'shield',49,4.5,82,false,'2026-02-27'),
('wl-001','Detox Herbal Wellness Tea','Zuldal Wellness','wellness',5200,null,'A calming daily blend of moringa, ginger & lemongrass.','A caffeine-free herbal tea blend crafted to support digestion and daily detox. Steep and sip as part of a calming morning or evening ritual.',array['Natural','Safe'],'leaf',90,4.6,133,true,'2026-05-20'),
('wl-002','Vitamin C + Zinc Effervescent Tablets','VitaCore','wellness',6800,null,'Daily immunity support, 20 effervescent tablets.','A great-tasting effervescent tablet packed with Vitamin C, Zinc and Vitamin D3 to support daily immune health. Just drop, dissolve and drink.',array['Safe','Natural'],'shield',74,4.5,97,false,'2026-04-09'),
('wl-003','Muscle Recovery & Massage Balm','Zuldal Wellness','wellness',7400,null,'Soothing balm for post-workout recovery.','A warming balm with arnica, eucalyptus and menthol that eases tension in tired muscles and joints after exercise or a long day.',array['Natural','Hydrating'],'dumbbell',38,4.7,64,false,'2026-03-05'),
('wl-004','Deep Sleep Support Gummies','VitaCore','wellness',8900,null,'Melatonin & chamomile gummies for restful sleep.','Fall asleep naturally with a gentle blend of melatonin, chamomile and L-theanine. Non-habit forming and gentle enough for nightly use.',array['Natural','Safe'],'heart',55,4.4,71,false,'2026-01-18'),
('p-001','Oud Noir Eau de Parfum','Maison Zuldal','perfumes',32000,38000,'A bold, smoky oud fragrance with amber depth.','An intense, long-lasting fragrance built around dark oud, amber and warm spice notes. A unisex signature scent for evening wear that lasts from dusk till dawn.',array['Long Wear','Cruelty Free'],'bottle',22,4.9,184,true,'2026-05-15'),
('p-002','Blush Bloom Eau de Parfum','Maison Zuldal','perfumes',28500,null,'A soft floral scent with rose and peony petals.','A delicate floral bouquet of rose, peony and white musk, designed for everyday wear with a soft sillage that lingers gently through the day.',array['Long Wear','Natural'],'bottle',30,4.7,112,false,'2026-04-22'),
('p-003','Citrus Vetiver Cologne','Terra Grooming','perfumes',21000,null,'A crisp, fresh cologne for daytime wear.','A fresh, energizing blend of bergamot, grapefruit and vetiver — light enough for daily office wear, sharp enough to stand out.',array['Long Wear','All Skin Types'],'bottle',41,4.5,88,false,'2026-02-08'),
('p-004','Velvet Amber Travel Perfume Set','Maison Zuldal','perfumes',18500,null,'3 x 15ml travel-size amber fragrances.','A trio of miniature amber-based fragrances perfect for travel or gifting, each with a distinct warm, cozy character.',array['Long Wear'],'bottle',26,4.6,53,false,'2026-01-30'),
('tw-001','Turare Amber Musk Fragrance Oil','Gidauniya Turare','turaren-wuta',9500,null,'Classic amber musk oil-based turaren wuta.','A traditional Northern Nigerian oil-based fragrance blending amber, musk and warm woods. Long-lasting on skin and fabric, cherished for generations.',array['Long Wear','Natural'],'flame',47,4.8,139,true,'2026-05-08'),
('tw-002','Bakhoor Oud Wood Chips','Gidauniya Turare','turaren-wuta',7800,null,'Fragrant bakhoor wood chips for home & clothing.','Premium oud-soaked bakhoor wood chips, burned to perfume homes, clothing and special occasions with a deep, smoky, long-lasting scent.',array['Natural','Long Wear'],'flame',63,4.7,101,false,'2026-03-19'),
('tw-003','Rose Ittar Attar Oil','Zuwara Attars','turaren-wuta',8600,null,'Pure rose attar, alcohol-free and long lasting.','A concentrated, alcohol-free rose attar oil rooted in traditional perfumery. A few drops offer hours of soft, floral fragrance.',array['Natural','Long Wear','All Skin Types'],'flame',52,4.6,76,false,'2026-02-25'),
('tw-004','Sandalwood & Spice Turare Blend','Zuwara Attars','turaren-wuta',10200,null,'Warm sandalwood turare with clove & spice notes.','A warm, grounding blend of sandalwood, clove and traditional spice notes — a modern take on a heritage turaren wuta recipe.',array['Natural','Long Wear'],'flame',35,4.8,64,false,'2026-01-12')
on conflict (id) do nothing;

-- ---------- Make yourself an admin ----------
-- 1. Create your login first: Supabase Dashboard > Authentication > Users > Add user
--    (set an email + password directly, no email confirmation needed).
-- 2. Then run this, swapping in the email you used above:
--
-- insert into public.profiles (id, role)
-- select id, 'admin' from auth.users where email = 'you@example.com'
-- on conflict (id) do update set role = 'admin';
