-- Traffic attribution per order: { first_touch, last_touch }, each with
-- source/medium/campaign/term/content, gclid, fbclid, referrer, landing_page,
-- and a timestamp. Captured client-side (src/lib/attribution.ts), validated
-- and written by /api/checkout. Null for orders predating this feature.
alter table public.orders
  add column if not exists attribution jsonb;
