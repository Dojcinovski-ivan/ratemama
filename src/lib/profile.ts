import { createClient } from '@/lib/supabase/server'

export const PUBLIC_PROFILE_FIELDS =
  'id, username, first_name, city, country, bio, profile_photo_url, is_founding_member, privacy_setting, created_at'

export type PublicProfile = {
  id: string
  username: string | null
  first_name: string | null
  city: string | null
  country: string | null
  bio: string | null
  profile_photo_url: string | null
  is_founding_member: boolean | null
  privacy_setting: string | null
  created_at: string
}

export async function getProfileByUsername(username: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('users')
    .select(PUBLIC_PROFILE_FIELDS)
    .eq('username', username)
    .maybeSingle()
  return data as PublicProfile | null
}

/** Rating count, helpful votes received, following and followers. */
export async function getProfileStats(userId: string) {
  const supabase = createClient()

  const [ratings, following, followers] = await Promise.all([
    supabase.from('ratings').select('helpful_count', { count: 'exact' }).eq('user_id', userId),
    supabase.from('follows').select('id', { count: 'exact', head: true }).eq('follower_id', userId),
    supabase.from('follows').select('id', { count: 'exact', head: true }).eq('following_id', userId),
  ])

  const helpful = ((ratings.data ?? []) as { helpful_count: number | null }[]).reduce(
    (sum, v) => sum + (v.helpful_count ?? 0),
    0
  )

  return {
    ratings: ratings.count ?? 0,
    helpful,
    following: following.count ?? 0,
    followers: followers.count ?? 0,
  }
}

/** Row shapes used by the profile and friends screens. */
export type ProfileRatingRow = {
  id: string
  rating: string
  price_paid: number | null
  currency: string | null
  supermarket: string
  reason: string
  alternative_product: string | null
  helpful_count: number | null
  created_at: string
  user_id?: string
  users?: {
    first_name: string | null
    city: string | null
    username: string | null
    profile_photo_url: string | null
  } | null
  products?: {
    slug: string | null
    name: string
    brand: string | null
    image_url: string | null
  } | null
}

export type SavedProductRow = {
  id: string
  created_at: string
  products: {
    id: string
    slug: string | null
    name: string
    brand: string | null
    image_url: string | null
  } | null
}

export type SuggestedPerson = {
  id: string
  username: string | null
  first_name: string | null
  city: string | null
  profile_photo_url: string | null
}
