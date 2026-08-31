-- Phase 6: onboarding first, account second.
--
-- People now answer the onboarding questions before they have an
-- account, and are signed in the moment they create one. Supabase's own
-- email confirmation is switched off in the dashboard, so verification
-- becomes ours to track and ours to send.

-- ============================================================
-- 1. WE TRACK EMAIL VERIFICATION OURSELVES
-- The token is not stored. It is an HMAC of the user id, checked on
-- the way back in, the same approach the unsubscribe links use.
-- ============================================================

alter table users add column if not exists email_verified boolean not null default false;
alter table users add column if not exists email_verified_at timestamp with time zone;

-- Anyone who signed up under the old Supabase confirmation flow already
-- proved they own their address, so they start verified.
update users u
set email_verified = true,
    email_verified_at = coalesce(u.email_verified_at, now())
from auth.users a
where a.id = u.id
  and a.email_confirmed_at is not null
  and u.email_verified = false;

-- Readable by the account owner only. It drives the feed banner and
-- says nothing useful to anybody else.
grant select (email_verified) on users to authenticated;

-- ============================================================
-- 2. SURNAME IS NO LONGER COLLECTED
-- The new signup form does not ask for it, so requiring it would mean
-- storing an empty string for every member forever.
-- ============================================================

alter table users alter column surname drop not null;
alter table users alter column surname drop default;

-- Empty strings left by the old form become genuine nulls.
update users set surname = null where surname = '';

-- ============================================================
-- 3. SIGNUP TRIGGER
-- Surname is optional, verification starts false, and the handle is
-- still generated automatically.
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
    profile_photo_url, is_founding_member, username,
    email_verified,
    email_marketing_consent, email_marketing_consent_date
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    nullif(new.raw_user_meta_data ->> 'surname', ''),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'city', ''),
    coalesce(new.raw_user_meta_data ->> 'country', ''),
    nullif(new.raw_user_meta_data ->> 'profile_photo_url', ''),
    true,
    public.generate_username(coalesce(new.raw_user_meta_data ->> 'first_name', '')),
    false,
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
