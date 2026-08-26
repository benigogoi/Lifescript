-- Flag internal/test orders (owner's own QA emails, Razorpay reviewer, ₹1
-- dev-test amounts) so the admin dashboard and revenue stats reflect real
-- customers only. Backfills existing rows using the same criteria the app
-- applies going forward in src/lib/orders.ts (createOrder).
alter table public.orders
  add column if not exists is_test boolean not null default false;

update public.orders
set is_test = true
where email in ('beni.gogoi1@gmail.com', 'benigogoi28@gmail.com', 'susanta.nayak@ie.razorpay.com')
   or amount_inr = 1;
