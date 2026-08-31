'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'

/**
 * Screens that own the whole viewport and should not show navigation.
 * The landing page carries its own header, so it is matched exactly
 * rather than by prefix.
 */
const HIDDEN_ON = ['/register', '/login', '/forgot-password', '/onboarding', '/auth']
const HIDDEN_EXACT = ['/']

const TABS = [
  { href: '/feed', label: 'Feed', icon: HomeIcon },
  { href: '/discover', label: 'Discover', icon: SearchIcon },
  { href: '/friends', label: 'Friends', icon: PeopleIcon },
  { href: '/profile', label: 'Profile', icon: PersonIcon },
]

export function Nav() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [signedIn, setSignedIn] = useState(false)
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    const supabase = createClient()

    async function refresh(userId: string | undefined) {
      setSignedIn(Boolean(userId))
      if (!userId) {
        setUnread(0)
        return
      }
      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false)
      setUnread(count ?? 0)
    }

    supabase.auth.getUser().then(({ data }) => refresh(data.user?.id))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) =>
      refresh(session?.user?.id)
    )
    setMenuOpen(false)
    return () => sub.subscription.unsubscribe()
    // Re runs on navigation so the badge clears once the notifications
    // screen has marked them read, rather than staying stale until a
    // full page reload.
  }, [pathname])

  if (HIDDEN_EXACT.includes(pathname)) return null
  if (HIDDEN_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  async function logOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <>
      {/* Desktop */}
      <header className="sticky top-0 z-40 hidden border-b border-neutral-200 bg-white/90 backdrop-blur sm:block">
        <div className="mx-auto flex max-w-5xl items-center gap-8 px-6 py-3.5">
          <Link href={signedIn ? '/feed' : '/'} className="text-lg font-bold text-worth">
            RateMama
          </Link>

          <nav className="flex items-center gap-6">
            {TABS.slice(0, 3).map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'text-sm font-medium transition-colors',
                  isActive(tab.href) ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-800'
                )}
              >
                {tab.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {signedIn ? (
              <>
              <Link
                href="/notifications"
                aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 hover:text-neutral-900"
              >
                <BellIcon className="h-5 w-5" />
                {unread > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-notworth px-1 text-[10px] font-bold text-white">
                    {unread > 9 ? '9' : unread}
                  </span>
                )}
              </Link>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((o) => !o)}
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-worth-soft text-sm font-semibold text-[#2f7a55]"
                >
                  <PersonIcon className="h-5 w-5" />
                </button>
                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-11 w-44 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg"
                  >
                    <Link href="/profile" role="menuitem" className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50">
                      Profile
                    </Link>
                    <Link href="/settings" role="menuitem" className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50">
                      Settings
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={logOut}
                      className="block w-full px-4 py-2.5 text-left text-sm text-neutral-700 hover:bg-neutral-50"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
                  Log in
                </Link>
                <Link
                  href="/onboarding/household"
                  className="rounded-xl bg-worth px-4 py-2 text-sm font-semibold text-worth-fg"
                >
                  Join free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile bell and account menu, since the bottom bar holds the four
          tabs and the desktop header is hidden on a phone. Without this
          there is no way to reach settings, the home page or log out. */}
      {signedIn && (
        <div className="fixed right-4 top-4 z-40 flex items-center gap-2 sm:hidden">
          <Link
            href="/notifications"
            aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-sm"
          >
            <BellIcon className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-notworth px-1 text-[10px] font-bold text-white">
                {unread > 9 ? '9' : unread}
              </span>
            )}
          </Link>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Account menu"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-sm"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
            {menuOpen && (
              <>
                <button
                  type="button"
                  aria-hidden
                  tabIndex={-1}
                  onClick={() => setMenuOpen(false)}
                  className="fixed inset-0 -z-10 cursor-default"
                />
                <div
                  role="menu"
                  className="absolute right-0 top-12 w-48 overflow-hidden rounded-2xl border border-neutral-200 bg-white py-1 shadow-lg"
                >
                  <Link
                    href="/"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm text-neutral-700"
                  >
                    Home
                  </Link>
                  <Link
                    href="/settings"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm text-neutral-700"
                  >
                    Settings
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={logOut}
                    className="block w-full px-4 py-2.5 text-left text-sm text-neutral-700"
                  >
                    Log out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Mobile */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white pb-[env(safe-area-inset-bottom)] sm:hidden"
      >
        <ul className="mx-auto flex max-w-app">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const active = isActive(tab.href)
            return (
              <li key={tab.href} className="flex-1">
                <Link
                  href={tab.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors',
                    active ? 'text-worth' : 'text-neutral-500'
                  )}
                >
                  <Icon className="h-6 w-6" />
                  {tab.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}

type IconProps = { className?: string }

function HomeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <path d="M3 10.5L12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 9.5V20h13V9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function SearchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" strokeLinecap="round" />
    </svg>
  )
}
function PeopleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3.5 19c0-3 2.5-4.8 5.5-4.8s5.5 1.8 5.5 4.8" strokeLinecap="round" />
      <path d="M16 6.4a3 3 0 010 5.6M17.5 18.6c0-2.2-.8-3.6-2-4.5" strokeLinecap="round" />
    </svg>
  )
}
function BellIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <path d="M18 9a6 6 0 10-12 0c0 5-2 6-2 6h16s-2-1-2-6z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.7 20a2 2 0 01-3.4 0" strokeLinecap="round" />
    </svg>
  )
}
function PersonIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5 19.5c0-3.3 3-5.3 7-5.3s7 2 7 5.3" strokeLinecap="round" />
    </svg>
  )
}

function MenuIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  )
}
