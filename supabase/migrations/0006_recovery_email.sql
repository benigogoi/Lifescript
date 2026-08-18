-- 0006: abandoned-checkout recovery tracking.
-- Set once we've emailed a customer whose order stayed in 'created' (Razorpay
-- checkout opened, payment never completed) — prevents re-sending the nudge.
alter table orders
  add column if not exists recovery_email_sent_at timestamptz;
