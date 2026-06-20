-- LifeScript — admin credentials + expense tracking.
-- Run after 0001_init.sql.

-- Singleton row (id always 1) holding the admin login. Seeded lazily by the
-- app: until this row exists, login falls back to ADMIN_PASSWORD/"admin" from
-- env (see src/lib/admin-auth.ts), so there's no manual seed step required.
create table admin_credentials (
  id            smallint primary key default 1 check (id = 1),
  username      text not null,
  password_hash text not null, -- "salt_hex:hash_hex" (Node scrypt)
  updated_at    timestamptz not null default now()
);

create trigger admin_credentials_updated_at
  before update on admin_credentials
  for each row execute function set_updated_at();

alter table admin_credentials enable row level security;

-- Manually-logged business costs (Claude/Resend/Razorpay fees, hosting, ads,
-- domain, etc.) so the dashboard can show a real net-profit figure alongside
-- revenue. No external integration pulls these automatically yet.
create table expenses (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  spent_on     date not null default current_date,
  category     text not null,
  description  text,
  amount_inr   integer not null
);

create index expenses_spent_on_idx on expenses (spent_on);

alter table expenses enable row level security;
