-- RateMama initial schema
-- Tables, signup trigger, indexes and row level security.

-- ============================================================
-- 1. TABLES
-- ============================================================

create table users (
  id uuid primary key references auth.users on delete cascade,
  first_name text not null,
  surname text not null,
  email text not null,
  city text not null,
  country text not null,
  profile_photo_url text,
  bio text,
  is_founding_member boolean default false,
  email_marketing_consent boolean default false,
  email_marketing_consent_date timestamp with time zone,
  created_at timestamp with time zone default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  off_id text unique not null,
  name text not null,
  brand text,
  category text not null,
  subcategory text,
  image_url text,
  barcode text unique,
  average_price_gbp numeric,
  country_availability text[],
  supermarkets text[],
  worth_it_count integer default 0,
  not_worth_it_count integer default 0,
  total_verdicts integer default 0,
  worth_it_percentage numeric default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table verdicts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users on delete cascade not null,
  product_id uuid references products on delete cascade not null,
  verdict text not null check (verdict in ('worth_it', 'not_worth_it')),
  price_paid numeric not null,
  currency text default 'GBP',
  supermarket text not null,
  reason text not null,
  alternative_product text,
  helpful_count integer default 0,
  created_at timestamp with time zone default now(),
  unique(user_id, product_id)
);

create table swipe_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users on delete cascade not null,
  product_id uuid references products on delete cascade not null,
  response text not null check (response in ('worth_it', 'not_worth_it', 'never_tried')),
  created_at timestamp with time zone default now(),
  unique(user_id, product_id)
);

create table user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users on delete cascade unique not null,
  household_type text not null,
  shopping_categories text[] not null,
  preferred_supermarkets text[] not null,
  onboarding_completed boolean default false,
  created_at timestamp with time zone default now()
);

create table follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid references users on delete cascade not null,
  following_id uuid references users on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique(follower_id, following_id),
  check (follower_id <> following_id)
);

create table verdict_votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users on delete cascade not null,
  verdict_id uuid references verdicts on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique(user_id, verdict_id)
);

create table saved_products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users on delete cascade not null,
  product_id uuid references products on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique(user_id, product_id)
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users on delete cascade not null,
  type text not null,
  title text not null,
  body text not null,
  read boolean default false,
  created_at timestamp with time zone default now()
);

create table sent_emails (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users on delete cascade not null,
  email_type text not null,
  sent_at timestamp with time zone default now(),
  unique(user_id, email_type)
);

-- ============================================================
-- 2. SIGNUP TRIGGER
-- Creates the public.users row whenever an auth user is created.
-- Pass first_name, surname, city and country in the signUp
-- options.data payload so they land in raw_user_meta_data.
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (
    id, first_name, surname, email, city, country,
    email_marketing_consent, email_marketing_consent_date
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'surname', ''),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'city', ''),
    coalesce(new.raw_user_meta_data ->> 'country', ''),
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep products.updated_at accurate.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_touch_updated_at
  before update on products
  for each row execute function public.touch_updated_at();

-- ============================================================
-- 3. INDEXES
-- Postgres does not index foreign keys automatically.
-- ============================================================

create index verdicts_product_id_idx on verdicts (product_id);
create index verdicts_user_id_idx on verdicts (user_id);
create index verdicts_created_at_idx on verdicts (created_at desc);
create index swipe_responses_user_id_idx on swipe_responses (user_id);
create index swipe_responses_product_id_idx on swipe_responses (product_id);
create index follows_follower_id_idx on follows (follower_id);
create index follows_following_id_idx on follows (following_id);
create index verdict_votes_verdict_id_idx on verdict_votes (verdict_id);
create index verdict_votes_user_id_idx on verdict_votes (user_id);
create index saved_products_user_id_idx on saved_products (user_id);
create index notifications_user_id_read_idx on notifications (user_id, read);
create index products_category_idx on products (category);

-- ============================================================
-- 4. ROW LEVEL SECURITY
-- Every table is locked by default. The service role key
-- bypasses RLS entirely, so imports and system writes still work.
-- ============================================================

alter table users enable row level security;
alter table products enable row level security;
alter table verdicts enable row level security;
alter table swipe_responses enable row level security;
alter table user_profiles enable row level security;
alter table follows enable row level security;
alter table verdict_votes enable row level security;
alter table saved_products enable row level security;
alter table notifications enable row level security;
alter table sent_emails enable row level security;

-- ---------- users ----------
-- Profiles are visible to signed in users so verdict authors and
-- follow lists can render. Email and marketing consent are held back
-- with column grants, because RLS filters rows and not columns.

revoke all on users from anon, authenticated;

grant select (
  id, first_name, surname, city, country,
  profile_photo_url, bio, is_founding_member, created_at
) on users to authenticated;

grant update (
  first_name, surname, city, country, profile_photo_url, bio,
  email_marketing_consent, email_marketing_consent_date
) on users to authenticated;

grant insert on users to authenticated;

create policy "Profiles are readable by signed in users"
  on users for select to authenticated using (true);

create policy "Users insert their own profile"
  on users for insert to authenticated with check (auth.uid() = id);

create policy "Users update their own profile"
  on users for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

-- ---------- products ----------
-- Readable by anyone including logged out visitors, so product pages
-- can be indexed. Writes are service role only via the import job.

create policy "Products are readable by everyone"
  on products for select to anon, authenticated using (true);

-- ---------- verdicts ----------

create policy "Verdicts are readable by everyone"
  on verdicts for select to anon, authenticated using (true);

create policy "Users create their own verdict"
  on verdicts for insert to authenticated with check (auth.uid() = user_id);

create policy "Users update their own verdict"
  on verdicts for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users delete their own verdict"
  on verdicts for delete to authenticated using (auth.uid() = user_id);

-- ---------- swipe_responses ----------
-- Private. Only the person who swiped can see their answers.

create policy "Users read their own swipes"
  on swipe_responses for select to authenticated using (auth.uid() = user_id);

create policy "Users create their own swipes"
  on swipe_responses for insert to authenticated with check (auth.uid() = user_id);

create policy "Users update their own swipes"
  on swipe_responses for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- user_profiles ----------
-- Private onboarding preferences.

create policy "Users read their own preferences"
  on user_profiles for select to authenticated using (auth.uid() = user_id);

create policy "Users create their own preferences"
  on user_profiles for insert to authenticated with check (auth.uid() = user_id);

create policy "Users update their own preferences"
  on user_profiles for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- follows ----------

create policy "Follows are readable by signed in users"
  on follows for select to authenticated using (true);

create policy "Users follow as themselves"
  on follows for insert to authenticated with check (auth.uid() = follower_id);

create policy "Users unfollow as themselves"
  on follows for delete to authenticated using (auth.uid() = follower_id);

-- ---------- verdict_votes ----------

create policy "Votes are readable by signed in users"
  on verdict_votes for select to authenticated using (true);

create policy "Users vote as themselves"
  on verdict_votes for insert to authenticated with check (auth.uid() = user_id);

create policy "Users remove their own vote"
  on verdict_votes for delete to authenticated using (auth.uid() = user_id);

-- ---------- saved_products ----------
-- Private saved list.

create policy "Users read their own saved products"
  on saved_products for select to authenticated using (auth.uid() = user_id);

create policy "Users save products as themselves"
  on saved_products for insert to authenticated with check (auth.uid() = user_id);

create policy "Users unsave their own products"
  on saved_products for delete to authenticated using (auth.uid() = user_id);

-- ---------- notifications ----------
-- Readable and markable as read by the recipient. Created by the
-- service role only, so nobody can send themselves a notification.

create policy "Users read their own notifications"
  on notifications for select to authenticated using (auth.uid() = user_id);

create policy "Users mark their own notifications read"
  on notifications for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- sent_emails ----------
-- No policies on purpose. This is an internal send log, reachable
-- only by the service role. RLS with zero policies denies everyone else.
