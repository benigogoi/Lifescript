-- Mystic Digits — track per-order Claude API cost for margin visibility.

alter table orders
  add column claude_cost_usd numeric(10, 6);
