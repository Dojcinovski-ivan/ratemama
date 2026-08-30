import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Where a signed in user belongs: the feed once onboarding is done,
 * otherwise back into onboarding.
 */
export async function destinationForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<'/feed' | '/onboarding'> {
  const { data } = await supabase
    .from('user_profiles')
    .select('onboarding_completed')
    .eq('user_id', userId)
    .maybeSingle()

  return data?.onboarding_completed ? '/feed' : '/onboarding'
}
