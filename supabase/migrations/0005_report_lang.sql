-- 0005: per-order report language.
-- 'en' = English (default), 'as' = Assamese (অসমীয়া). Hindi ('hi') reserved.
alter table orders
  add column if not exists report_lang text not null default 'en';

alter table orders
  add constraint orders_report_lang_check
  check (report_lang in ('en', 'as', 'hi'));
