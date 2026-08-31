-- 0009: featured products and community seed ratings
--
-- 1. products.featured / popularity_score power the curated swipe deck and feed.
-- 2. ratings.is_community_seed marks ratings written by RateMama itself so they
--    can be labelled in the UI and, crucially, kept out of the headline numbers.
-- 3. recount_product_ratings is narrowed so worth_it_percentage and
--    total_ratings only ever reflect real members.

alter table products
  add column if not exists featured boolean not null default false,
  add column if not exists popularity_score integer not null default 0;

alter table ratings
  add column if not exists is_community_seed boolean not null default false,
  add column if not exists seed_source text;

create index if not exists products_featured_idx
  on products (popularity_score desc) where featured;

create index if not exists ratings_not_seed_idx
  on ratings (product_id) where not is_community_seed;

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
      and not is_community_seed   -- community seeds never move the numbers
  ) c
  where p.id = target;
end;
$$;
