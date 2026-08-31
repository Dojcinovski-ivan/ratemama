-- Phase 4: usernames, profile privacy, notification links and triggers

-- ============================================================
-- 1. USERNAMES AND PRIVACY
-- ============================================================

alter table users add column if not exists username text unique;
alter table users add column if not exists privacy_setting text default 'public';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'users_privacy_setting_check'
  ) then
    alter table users add constraint users_privacy_setting_check
      check (privacy_setting in ('public', 'friends'));
  end if;
end;
$$;

alter table users add column if not exists bio_updated_at timestamp with time zone;

-- Handle is first name plus four digits. The surname never appears,
-- not even as an initial, because the username sits in a public URL.
create or replace function public.generate_username(first text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  base text;
  candidate text;
  tries int := 0;
begin
  base := regexp_replace(lower(coalesce(nullif(trim(first), ''), 'member')), '[^a-z0-9]+', '', 'g');
  if base = '' then
    base := 'member';
  end if;
  base := left(base, 20);

  loop
    candidate := base || '_' || lpad((floor(random() * 10000))::int::text, 4, '0');
    exit when not exists (select 1 from public.users where username = candidate);
    tries := tries + 1;
    if tries > 25 then
      candidate := base || '_' || replace(gen_random_uuid()::text, '-', '');
      candidate := left(candidate, 30);
      exit;
    end if;
  end loop;

  return candidate;
end;
$$;

-- Give every existing account a handle.
update users
set username = public.generate_username(first_name)
where username is null;

alter table users alter column privacy_setting set not null;

-- New signups get one automatically.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (
    id, first_name, surname, email, city, country,
    profile_photo_url, is_founding_member, username,
    email_marketing_consent, email_marketing_consent_date
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'surname', ''),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'city', ''),
    coalesce(new.raw_user_meta_data ->> 'country', ''),
    nullif(new.raw_user_meta_data ->> 'profile_photo_url', ''),
    true,
    public.generate_username(coalesce(new.raw_user_meta_data ->> 'first_name', '')),
    coalesce((new.raw_user_meta_data ->> 'email_marketing_consent')::boolean, false),
    case
      when (new.raw_user_meta_data ->> 'email_marketing_consent')::boolean
      then now()
      else null
    end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- The public profile columns now include the handle and the setting.
grant select (username, privacy_setting) on users to anon, authenticated;
grant update (username, privacy_setting) on users to authenticated;

-- ============================================================
-- 2. FRIENDS ONLY REALLY MEANS FRIENDS ONLY
--
-- The profile header stays visible so people can find you and choose
-- to follow. What a friends only setting hides is the verdicts. Two
-- accounts count as friends when each follows the other, so simply
-- following someone is not enough to see their private verdicts.
-- ============================================================

create or replace function public.can_see_verdicts_of(author uuid)
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

drop policy if exists "Verdicts are readable by everyone" on verdicts;
create policy "Verdicts are readable when the author allows it"
  on verdicts for select to anon, authenticated
  using (public.can_see_verdicts_of(user_id));

-- ============================================================
-- 3. NOTIFICATIONS CAN BE TAPPED
-- ============================================================

alter table notifications add column if not exists link text;

create index if not exists notifications_user_unread_idx
  on notifications (user_id, read, created_at desc);

-- ============================================================
-- 4. NOTIFICATION TRIGGERS
-- The notifications table has no insert policy, so only these
-- security definer functions and the service role can write to it.
-- ============================================================

-- Someone found your verdict helpful.
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
  select v.user_id, p.name, p.slug into author, product_name, product_slug
  from public.verdicts v join public.products p on p.id = v.product_id
  where v.id = new.verdict_id;

  if author is null or author = new.user_id then
    return null;
  end if;

  select first_name, city into actor_name, actor_city
  from public.users where id = new.user_id;

  insert into public.notifications (user_id, type, title, body, link)
  values (
    author,
    'helpful_vote',
    'Someone found your verdict helpful',
    coalesce(actor_name, 'Someone')
      || case when actor_city is not null and actor_city <> '' then ' from ' || actor_city else '' end
      || ' found your verdict on ' || product_name || ' helpful.',
    '/products/' || product_slug
  );

  return null;
end;
$$;

drop trigger if exists notify_helpful_vote on verdict_votes;
create trigger notify_helpful_vote
  after insert on verdict_votes
  for each row execute function public.notify_helpful_vote();

-- Someone followed you.
create or replace function public.notify_new_follower()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_name text;
  actor_city text;
  actor_handle text;
begin
  select first_name, city, username into actor_name, actor_city, actor_handle
  from public.users where id = new.follower_id;

  insert into public.notifications (user_id, type, title, body, link)
  values (
    new.following_id,
    'new_follower',
    'You have a new follower',
    coalesce(actor_name, 'Someone')
      || case when actor_city is not null and actor_city <> '' then ' from ' || actor_city else '' end
      || ' started following you.',
    '/profile/' || coalesce(actor_handle, '')
  );

  return null;
end;
$$;

drop trigger if exists notify_new_follower on follows;
create trigger notify_new_follower
  after insert on follows
  for each row execute function public.notify_new_follower();

-- Someone reviewed a product you saved.
create or replace function public.notify_saved_product_verdict()
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
  verdict_words text;
begin
  select first_name, city into actor_name, actor_city
  from public.users where id = new.user_id;

  select name, slug into product_name, product_slug
  from public.products where id = new.product_id;

  verdict_words := case when new.verdict = 'worth_it' then 'Worth It' else 'Not Worth It' end;

  insert into public.notifications (user_id, type, title, body, link)
  select s.user_id,
         'saved_product_verdict',
         'New verdict on a product you saved',
         coalesce(actor_name, 'Someone')
           || case when actor_city is not null and actor_city <> '' then ' from ' || actor_city else '' end
           || ' reviewed ' || product_name || '. They said it is ' || verdict_words || '.',
         '/products/' || product_slug
  from public.saved_products s
  where s.product_id = new.product_id and s.user_id <> new.user_id;

  return null;
end;
$$;

drop trigger if exists notify_saved_product_verdict on verdicts;
create trigger notify_saved_product_verdict
  after insert on verdicts
  for each row execute function public.notify_saved_product_verdict();

-- A product you reviewed reached ten verdicts.
create or replace function public.notify_ten_verdicts()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.total_verdicts = 10 and coalesce(old.total_verdicts, 0) < 10 then
    insert into public.notifications (user_id, type, title, body, link)
    select v.user_id,
           'ten_verdicts',
           'Your early review is paying off',
           'Your review of ' || new.name
             || ' is now one of 10 verdicts. Thanks for being an early reviewer.',
           '/products/' || new.slug
    from public.verdicts v
    where v.product_id = new.id;
  end if;

  return null;
end;
$$;

drop trigger if exists notify_ten_verdicts on products;
create trigger notify_ten_verdicts
  after update of total_verdicts on products
  for each row execute function public.notify_ten_verdicts();

-- Welcome to the first hundred founding members.
create or replace function public.notify_founding_member()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.users) <= 100 then
    insert into public.notifications (user_id, type, title, body, link)
    values (
      new.id,
      'founding_member',
      'You are a founding member',
      'You are one of our first 100 founding members. Thank you for helping build RateMama.',
      '/profile/' || coalesce(new.username, '')
    );
  end if;

  return null;
end;
$$;

drop trigger if exists notify_founding_member on users;
create trigger notify_founding_member
  after insert on users
  for each row execute function public.notify_founding_member();
