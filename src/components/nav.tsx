'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'

/** Screens that own the whole viewport and should not show navigation. */
const HIDDEN_ON = ['/register', '/login', '/forgot-password', '/onboarding', '/auth']

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

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setSignedIn(Boolean(data.user)))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) =>
      setSignedIn(Boolean(session?.user))
    )
    return () => sub.subscription.unsubscribe()
  }, [])

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
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-worth px-4 py-2 text-sm font-semibold text-worth-fg"
                >
                  Join free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

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
function PersonIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5 19.5c0-3.3 3-5.3 7-5.3s7 2 7 5.3" strokeLinecap="round" />
    </svg>
  )
}
