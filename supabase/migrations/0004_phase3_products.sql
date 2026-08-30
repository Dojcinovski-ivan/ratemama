-- Phase 3: user added products, verdict photos, controversy sort

-- ============================================================
-- 1. USER ADDED PRODUCTS
-- off_id holds an Open Food Facts identifier. A product someone
-- adds by hand has none, so the column becomes nullable and the
-- uniqueness moves to a partial index that ignores nulls.
-- ============================================================

alter table products alter column off_id drop not null;

do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'products_off_id_key' and conrelid = 'public.products'::regclass
  ) then
    alter table products drop constraint products_off_id_key;
  end if;
end;
$$;

create unique index if not exists products_off_id_unique
  on products (off_id) where off_id is not null;

-- Who added it, so a manual entry can be traced back.
alter table products add column if not exists added_by uuid references users on delete set null;

-- ============================================================
-- 2. VERDICT PHOTOS
-- ============================================================

alter table verdicts add column if not exists photo_url text;

insert into storage.buckets (id, name, public)
values ('verdict-photos', 'verdict-photos', true)
on conflict (id) do nothing;

drop policy if exists "Verdict photos are publicly readable" on storage.objects;
create policy "Verdict photos are publicly readable"
  on storage.objects for select
  using (bucket_id = 'verdict-photos');

drop policy if exists "Users upload their own verdict photo" on storage.objects;
create policy "Users upload their own verdict photo"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'verdict-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users delete their own verdict photo" on storage.objects;
create policy "Users delete their own verdict photo"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'verdict-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- 3. CONTROVERSY SORT
-- Most controversial means closest to an even split, so we store
-- the distance from 50 and sort ascending. Products with no
-- verdicts sit at 50 and therefore fall to the bottom.
-- ============================================================

alter table products
  add column if not exists controversy numeric
  generated always as (abs(50 - coalesce(worth_it_percentage, 0))) stored;

create index if not exists products_controversy_idx on products (controversy);
create index if not exists products_total_verdicts_idx on products (total_verdicts desc);
create index if not exists products_worth_it_percentage_idx on products (worth_it_percentage desc);
create index if not exists products_created_at_idx on products (created_at desc);
