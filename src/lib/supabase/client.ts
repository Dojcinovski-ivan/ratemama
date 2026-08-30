import { createBrowserClient } from '@supabase/ssr'

/**
 * Supabase client for use in Client Components.
 * Safe to expose: only ever uses the publishable key and is bound by RLS.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
