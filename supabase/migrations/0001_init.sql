-- Mystic Digits — orders schema.
-- Run this in the Supabase project's SQL editor (or via `supabase db push`).
-- The order lifecycle is: created → paid → generating → ready → scheduled → sent.
-- 'held' and 'failed' are off-path states for admin review / errors.

create type order_status as enum (
  'created',    -- order row created, awaiting payment
  'paid',       -- Razorpay payment verified
  'generating', -- report content + PDF being produced
  'ready',      -- PDF generated and stored, awaiting send
  'scheduled',  -- send time chosen (scheduled_at set)
  'sent',       -- delivered to the customer
  'held',       -- admin hold for review (launch QA)
  'failed'      -- generation or delivery error
);

create table orders (
  id                   uuid primary key default gen_random_uuid(),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),

  -- customer / report inputs
  full_name            text not null,
  email                text not null,
  dob_day              smallint not null,
  dob_month            smallint not null,
  dob_year             smallint not null,

  -- product
  tier                 text not null default 'numerology', -- 'numerology' (₹99) | 'vedic' (₹199)
  amount_inr           integer not null default 99,

  -- lifecycle
  status               order_status not null default 'created',
  razorpay_order_id    text,
  razorpay_payment_id  text,
  pdf_path             text,         -- path within the 'reports' storage bucket
  scheduled_at         timestamptz,  -- when the auto-send job should deliver
  sent_at              timestamptz,
  error                text
);

create index orders_status_idx          on orders (status);
create index orders_scheduled_idx       on orders (scheduled_at) where status = 'scheduled';
create index orders_razorpay_order_idx  on orders (razorpay_order_id);

-- Keep updated_at fresh on every change.
-- `set search_path = ''` pins the function's schema resolution (security
-- hardening; satisfies the Supabase function_search_path_mutable advisor).
create or replace function set_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger orders_updated_at
  before update on orders
  for each row execute function set_updated_at();

-- Lock the table down: RLS on, no policies. All access is via the service-role
-- key from our Next.js server (which bypasses RLS). The public/anon key cannot
-- read or write orders.
alter table orders enable row level security;

-- Private bucket for the generated PDF reports.
insert into storage.buckets (id, name, public)
values ('reports', 'reports', false)
on conflict (id) do nothing;
