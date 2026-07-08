# Zuldal Admin

Internal admin dashboard for Zuldal Beauty & Wellness — confirm and track
orders, manage the product catalog and stock, and triage customer support
messages. Next.js (App Router) + Tailwind CSS on the frontend, Supabase
(Postgres + Auth + Row Level Security + Storage) as the backend. This is a
separate app from the public storefront, but connects to the **same**
Supabase project.

## One-time setup

1. Use the same Supabase project as the storefront (or create one and point
   the storefront at it too — see its README for the schema/seed steps).
2. **Run the SQL files** below in the Supabase project's SQL Editor, in this
   exact order (skip any that the storefront setup already applied):
   - `supabase/schema.sql`
   - `supabase/002_product_stats_function.sql`
   - `supabase/003_admin_orders_update.sql`
   - `supabase/004_product_images.sql`
   - `supabase/005_product_multiple_images.sql`
   - `supabase/006_support_messages.sql`
   - `supabase/007_orders_tracking_fields.sql`
   - `supabase/008_order_status_events.sql`
   - `supabase/009_support_messages_admin_access.sql`
   - `supabase/010_order_stats_function.sql`
   - `supabase/011_data_integrity_constraints.sql`
   - `supabase/012_update_order_status_function.sql`
   - `supabase/013_order_item_integrity_trigger.sql`
   - `supabase/014_order_item_stock_deduction.sql`
   - `supabase/015_product_cost_and_profit.sql`
   - `supabase/016_fix_product_stats_types.sql`
   - `supabase/017_inventory_value_at_cost.sql`
   - `supabase/018_low_stock_threshold.sql`
   - `supabase/019_order_payment_status.sql`
3. **Copy your project's API credentials**: in the Supabase dashboard, go to
   Settings → API, copy the Project URL and the `anon` public key into
   `.env.local` (copy `.env.local.example` first).
4. **Create your admin login**: in the Supabase dashboard, go to
   Authentication → Users → Add User, create yourself with an email/password.
   Then in the Table Editor, open the `profiles` table and insert a row:
   `id` = the new user's UUID (copy from the Users page), `role` = `admin`,
   `full_name` = your name. (Or run the snippet at the bottom of
   `supabase/schema.sql`.)

## Local development

```
npm install
npm run dev
```

Serves the dashboard at http://localhost:3000. Signing in requires a real
Supabase project connected (step 3 above) with an admin profile (step 4).

## What's in here

- **Dashboard** (`/dashboard`) — order and revenue stats, low stock alerts,
  recent orders and messages.
- **Orders** (`/orders`) — search and filter orders by status; each order's
  detail page supports one-click confirmation, full status updates with
  notes, courier/tracking number entry, and a tracking history timeline.
- **Products** (`/products`) — search/filter the catalog, see stock levels at
  a glance, and create/edit/delete products including photo uploads to
  Supabase Storage.
- **Messages** (`/messages`) — the customer support inbox (`support_messages`
  table), with read/unread tracking.
- **Settings** (`/settings`) — current admin's account info and instructions
  for adding another admin login.

Admin access is enforced both in the UI (redirects non-admins to an access
denied screen) and at the database level via Row Level Security — only rows
in `profiles` with `role = 'admin'` can read orders, order items, support
messages, or write to products.

## Notes

- Free Supabase projects pause after 7 days of no activity. If the app seems
  stuck loading, log into the Supabase dashboard and click "Restore".
- The `anon` key in `.env.local` is meant to be public; real access control
  is enforced by the Row Level Security policies in `supabase/*.sql`, not by
  keeping that key secret.
