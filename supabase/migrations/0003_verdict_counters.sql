-- Phase 3: verdict counters and public profile reads

-- ============================================================
-- 1. PRODUCT VERDICT COUNTS
-- Recomputed in the database so the numbers cannot drift if an
-- application path ever forgets to update them.
-- ============================================================

create or replace function public.recount_product_verdicts(target uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if target is null then
    return;
  end if;

  update public.products p
  set worth_it_count = c.worth,
      not_worth_it_count = c.not_worth,
      total_verdicts = c.total,
      worth_it_percentage = case
        when c.total = 0 then 0
        else round((c.worth::numeric / c.total) * 100, 1)
      end
  from (
    select
      count(*) filter (where verdict = 'worth_it') as worth,
      count(*) filter (where verdict = 'not_worth_it') as not_worth,
      count(*) as total
    from public.verdicts
    where product_id = target
  ) c
  where p.id = target;
end;
$$;

create or replace function public.verdicts_refresh_counts()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    perform public.recount_product_verdicts(old.product_id);
  else
    perform public.recount_product_verdicts(new.product_id);
    -- A verdict moving between products has to correct both sides.
    if tg_op = 'UPDATE' and old.product_id is distinct from new.product_id then
      perform public.recount_product_verdicts(old.product_id);
    end if;
  end if;

  return null;
end;
$$;

drop trigger if exists verdicts_refresh_counts on verdicts;
create trigger verdicts_refresh_counts
  after insert or update or delete on verdicts
  for each row execute function public.verdicts_refresh_counts();

-- ============================================================
-- 2. HELPFUL VOTE COUNTS
-- ============================================================

create or replace function public.verdict_votes_refresh_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target uuid;
begin
  target := coalesce(new.verdict_id, old.verdict_id);

  update public.verdicts v
  set helpful_count = (
    select count(*) from public.verdict_votes where verdict_id = target
  )
  where v.id = target;

  return null;
end;
$$;

drop trigger if exists verdict_votes_refresh_count on verdict_votes;
create trigger verdict_votes_refresh_count
  after insert or delete on verdict_votes
  for each row execute function public.verdict_votes_refresh_count();

-- ============================================================
-- 3. PUBLIC PROFILE READS
-- Product pages are public for search engines, so a logged out
-- visitor needs to see who left a verdict. Only the public columns
-- are granted. Email and marketing consent stay unreadable, and the
-- surname is never granted to anyone.
-- ============================================================

grant select (
  id, first_name, city, country,
  profile_photo_url, bio, is_founding_member, created_at
) on users to anon;

drop policy if exists "Profiles are readable by everyone" on users;
create policy "Profiles are readable by everyone"
  on users for select to anon using (true);

-- Backfill anything already in the table.
do $$
declare
  r record;
begin
  for r in select distinct product_id from public.verdicts loop
    perform public.recount_product_verdicts(r.product_id);
  end loop;
end;
$$;

-- ============================================================
-- 4. SURNAME IS PRIVATE
-- Migration 0001 granted surname to every signed in user, which
-- meant it was readable through the API even though no screen shows
-- it. Surname is now readable by nobody. A user reads their own
-- through the function below.
-- ============================================================

revoke select (surname) on users from authenticated;

create or replace function public.my_profile()
returns table (
  id uuid,
  first_name text,
  surname text,
  email text,
  city text,
  country text,
  profile_photo_url text,
  bio text,
  is_founding_member boolean,
  email_marketing_consent boolean
)
language sql
security definer
set search_path = ''
as $$
  select u.id, u.first_name, u.surname, u.email, u.city, u.country,
         u.profile_photo_url, u.bio, u.is_founding_member, u.email_marketing_consent
  from public.users u
  where u.id = auth.uid();
$$;

revoke all on function public.my_profile() from public, anon;
grant execute on function public.my_profile() to authenticated;
