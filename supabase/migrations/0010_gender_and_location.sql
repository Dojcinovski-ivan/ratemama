-- 0010: optional gender on the profile, and product audience
--
-- gender lives on user_profiles, which is readable only by its owner, so
-- it never reaches a public profile or a rating card. It is optional and
-- nullable by design: prefer_not_to_say is a real answer, and so is
-- skipping the question entirely.

alter table user_profiles add column if not exists gender text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'user_profiles_gender_check'
  ) then
    alter table user_profiles add constraint user_profiles_gender_check
      check (gender is null or gender in ('female', 'male', 'non_binary', 'prefer_not_to_say'));
  end if;
end $$;

-- Who a product is aimed at. Almost everything a family buys is 'any',
-- which is why that is the default and why nothing is ever hidden on the
-- basis of it. Only ranking is affected.
alter table products add column if not exists gender_affinity text not null default 'any';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'products_gender_affinity_check'
  ) then
    alter table products add constraint products_gender_affinity_check
      check (gender_affinity in ('any', 'female', 'male'));
  end if;
end $$;

create index if not exists products_gender_affinity_idx
  on products (gender_affinity) where gender_affinity <> 'any';
