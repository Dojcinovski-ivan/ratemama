-- Phase 5: verdicts become ratings, everywhere.
--
-- Tables keep their data, their foreign keys and their row level
-- security through the rename. What has to be rewritten by hand is the
-- seven functions that name these tables inside their bodies, and the
-- policies whose select rule calls one of those functions.

-- ============================================================
-- 1. TABLES AND COLUMNS
-- ============================================================

alter table verdicts rename to ratings;
alter table verdict_votes rename to rating_votes;

alter table ratings rename column verdict to rating;
alter table rating_votes rename column verdict_id to rating_id;
alter table products rename column total_verdicts to total_ratings;

-- ============================================================
-- 2. COUNT FUNCTIONS
-- ============================================================

drop trigger if exists verdicts_refresh_counts on ratings;
drop trigger if exists verdict_votes_refresh_count on rating_votes;
drop function if exists public.verdicts_refresh_counts();
drop function if exists public.verdict_votes_refresh_count();
drop function if exists public.recount_product_verdicts(uuid);

create or replace function public.recount_product_ratings(target uuid)
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
      total_ratings = c.total,
      worth_it_percentage = case
        when c.total = 0 then 0
        else round((c.worth::numeric / c.total) * 100, 1)
      end
  from (
    select
      count(*) filter (where rating = 'worth_it') as worth,
      count(*) filter (where rating = 'not_worth_it') as not_worth,
      count(*) as total
    from public.ratings
    where product_id = target
  ) c
  where p.id = target;
end;
$$;

create or replace function public.ratings_refresh_counts()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    perform public.recount_product_ratings(old.product_id);
  else
    perform public.recount_product_ratings(new.product_id);
    if tg_op = 'UPDATE' and old.product_id is distinct from new.product_id then
      perform public.recount_product_ratings(old.product_id);
    end if;
  end if;
  return null;
end;
$$;

create trigger ratings_refresh_counts
  after insert or update or delete on ratings
  for each row execute function public.ratings_refresh_counts();

create or replace function public.rating_votes_refresh_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target uuid;
begin
  target := coalesce(new.rating_id, old.rating_id);
  update public.ratings r
  set helpful_count = (
    select count(*) from public.rating_votes where rating_id = target
  )
  where r.id = target;
  return null;
end;
$$;

create trigger rating_votes_refresh_count
  after insert or delete on rating_votes
  for each row execute function public.rating_votes_refresh_count();

-- ============================================================
-- 3. PRIVACY
-- ============================================================

drop policy if exists "Verdicts are readable when the author allows it" on ratings;
drop function if exists public.can_see_verdicts_of(uuid);

create or replace function public.can_see_ratings_of(author uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    case
      when author = auth.uid() then true
      when coalesce(
        (select u.privacy_setting from public.users u where u.id = author), 'public'
      ) = 'public' then true
      when auth.uid() is null then false
      else
        exists (
          select 1 from public.follows f
          where f.follower_id = auth.uid() and f.following_id = author
        )
        and exists (
          select 1 from public.follows f
          where f.follower_id = author and f.following_id = auth.uid()
        )
    end;
$$;

create policy "Ratings are readable when the author allows it"
  on ratings for select to anon, authenticated
  using (public.can_see_ratings_of(user_id));

-- Rename the remaining policies so nothing still says verdict.
drop policy if exists "Users create their own verdict" on ratings;
drop policy if exists "Users update their own verdict" on ratings;
drop policy if exists "Users delete their own verdict" on ratings;

create policy "Users create their own rating"
  on ratings for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update their own rating"
  on ratings for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete their own rating"
  on ratings for delete to authenticated using (auth.uid() = user_id);

drop policy if exists "Votes are readable by signed in users" on rating_votes;
drop policy if exists "Users vote as themselves" on rating_votes;
drop policy if exists "Users remove their own vote" on rating_votes;

create policy "Votes are readable by signed in users"
  on rating_votes for select to authenticated using (true);
create policy "Users vote as themselves"
  on rating_votes for insert to authenticated with check (auth.uid() = user_id);
create policy "Users remove their own vote"
  on rating_votes for delete to authenticated using (auth.uid() = user_id);

-- ============================================================
-- 4. NOTIFICATION TRIGGERS
-- ============================================================

drop trigger if exists notify_helpful_vote on rating_votes;
drop trigger if exists notify_saved_product_verdict on ratings;
drop trigger if exists notify_ten_verdicts on products;
drop function if exists public.notify_helpful_vote();
drop function if exists public.notify_saved_product_verdict();
drop function if exists public.notify_ten_verdicts();

create or replace function public.notify_helpful_vote()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  author uuid;
  actor_name text;
  actor_city text;
  product_name text;
  product_slug text;
begin
  select r.user_id, p.name, p.slug into author, product_name, product_slug
  from public.ratings r join public.products p on p.id = r.product_id
  where r.id = new.rating_id;

  if author is null or author = new.user_id then
    return null;
  end if;

  select first_name, city into actor_name, actor_city
  from public.users where id = new.user_id;

  insert into public.notifications (user_id, type, title, body, link)
  values (
    author,
    'helpful_vote',
    'Someone found your rating helpful',
    coalesce(actor_name, 'Someone')
      || case when actor_city is not null and actor_city <> '' then ' from ' || actor_city else '' end
      || ' found your rating on ' || product_name || ' helpful.',
    '/products/' || product_slug
  );
  return null;
end;
$$;

create trigger notify_helpful_vote
  after insert on rating_votes
  for each row execute function public.notify_helpful_vote();

create or replace function public.notify_saved_product_rating()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_name text;
  actor_city text;
  product_name text;
  product_slug text;
  rating_words text;
begin
  select first_name, city into actor_name, actor_city
  from public.users where id = new.user_id;

  select name, slug into product_name, product_slug
  from public.products where id = new.product_id;

  rating_words := case when new.rating = 'worth_it' then 'Worth It' else 'Not Worth It' end;

  insert into public.notifications (user_id, type, title, body, link)
  select s.user_id,
         'saved_product_rating',
         'New rating on a product you saved',
         coalesce(actor_name, 'Someone')
           || case when actor_city is not null and actor_city <> '' then ' from ' || actor_city else '' end
           || ' rated ' || product_name || '. They said it is ' || rating_words || '.',
         '/products/' || product_slug
  from public.saved_products s
  where s.product_id = new.product_id and s.user_id <> new.user_id;

  return null;
end;
$$;

create trigger notify_saved_product_rating
  after insert on ratings
  for each row execute function public.notify_saved_product_rating();

create or replace function public.notify_ten_ratings()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.total_ratings = 10 and coalesce(old.total_ratings, 0) < 10 then
    insert into public.notifications (user_id, type, title, body, link)
    select r.user_id,
           'ten_ratings',
           'Your early rating is making an impact',
           'Your rating of ' || new.name
             || ' is now one of 10 ratings. Thanks for being an early rater.',
           '/products/' || new.slug
    from public.ratings r
    where r.product_id = new.id;
  end if;
  return null;
end;
$$;

create trigger notify_ten_ratings
  after update of total_ratings on products
  for each row execute function public.notify_ten_ratings();

-- ============================================================
-- 5. EMAIL LOG CAN RECORD REPEATED SENDS
-- One row per person, per kind of email, per thing it was about.
-- A welcome email has no reference and so can only ever send once.
-- ============================================================

alter table sent_emails add column if not exists reference_id text;

alter table sent_emails drop constraint if exists sent_emails_user_id_email_type_key;

create unique index if not exists sent_emails_unique_idx
  on sent_emails (user_id, email_type, coalesce(reference_id, ''));

-- ============================================================
-- 6. TIDY INDEX NAMES
-- ============================================================

alter index if exists verdicts_product_id_idx rename to ratings_product_id_idx;
alter index if exists verdicts_user_id_idx rename to ratings_user_id_idx;
alter index if exists verdicts_created_at_idx rename to ratings_created_at_idx;
alter index if exists verdict_votes_verdict_id_idx rename to rating_votes_rating_id_idx;
alter index if exists verdict_votes_user_id_idx rename to rating_votes_user_id_idx;
