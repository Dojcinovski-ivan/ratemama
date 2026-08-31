-- Migration 0004 replaced the unique constraint on products.off_id with a
-- partial unique index so that user added products could leave it null.
-- That was unnecessary: a plain unique constraint already permits many
-- null values. It also broke every upsert in the application, because
-- Postgres cannot infer an ON CONFLICT target from a partial index.

drop index if exists products_off_id_unique;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'products_off_id_key' and conrelid = 'public.products'::regclass
  ) then
    alter table products add constraint products_off_id_key unique (off_id);
  end if;
end;
$$;
