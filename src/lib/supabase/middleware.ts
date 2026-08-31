import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Routes that require a signed in user, matched on the path or any child.
 * Public profiles live at /profile/[username] and must stay readable
 * without an account, so /profile is matched exactly instead.
 */
const PROTECTED_PREFIXES = [
  '/feed',
  '/onboarding',
  '/settings',
  '/notifications',
  '/profile/edit',
]

/** Routes protected only as an exact match. */
const PROTECTED_EXACT = ['/profile']

/** Routes a signed in user should not see. */
const AUTH_ROUTES = ['/login', '/register']

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Always call getUser here. It revalidates the token with Supabase rather
  // than trusting the cookie, and it refreshes an expired session.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const isProtected =
    PROTECTED_EXACT.includes(pathname) ||
    PROTECTED_PREFIXES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    )

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (user && AUTH_ROUTES.includes(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/feed'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return response
}
