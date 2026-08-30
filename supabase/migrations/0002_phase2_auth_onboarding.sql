-- Phase 2: auth and onboarding support
-- Founding member flag, product slugs, profile photo storage.

-- ============================================================
-- 1. FOUNDING MEMBERS
-- Everyone joining now is a founding member.
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
    profile_photo_url, is_founding_member,
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

-- ============================================================
-- 2. PRODUCT SLUGS
-- Readable public product URLs.
-- ============================================================

alter table products add column if not exists slug text unique;
create index if not exists products_slug_idx on products (slug);

-- ============================================================
-- 3. PROFILE PHOTO STORAGE
-- Files live under a folder named after the user id, so the
-- policies can check ownership from the path.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', true)
on conflict (id) do nothing;

create policy "Profile photos are publicly readable"
  on storage.objects for select
  using (bucket_id = 'profile-photos');

create policy "Users upload their own profile photo"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users replace their own profile photo"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users delete their own profile photo"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
