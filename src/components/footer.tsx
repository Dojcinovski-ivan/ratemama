import Link from 'next/link'
import { Logo } from '@/components/landing/pieces'

export function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-page px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Logo dark />
            <p className="mt-3 text-sm text-white/70">Real ratings from real families</p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-3" aria-label="Footer">
            {[
              { href: '/discover', label: 'Browse products' },
              { href: '/register', label: 'Join free' },
              { href: '/privacy', label: 'Privacy Policy' },
              { href: '/terms', label: 'Terms' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-white/80 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex gap-3">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="RateMama on Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <svg viewBox="0 0 24 24" aria-hidden className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
                <circle cx="12" cy="12" r="3.8" />
                <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="RateMama on X"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="currentColor">
                <path d="M17.5 3h3l-6.6 7.5L21.7 21h-6l-4.7-6.1L5.6 21h-3l7-8L2.6 3h6.2l4.2 5.6zm-1 16h1.6L7.6 4.7H5.9z" />
              </svg>
            </a>
          </div>
        </div>

        <hr className="my-8 border-white/15" />

        <p className="text-sm text-white/60">
          RateMama is a community platform. Ratings are from real members not sponsored reviewers.
          Copyright 2026 RateMama
        </p>
      </div>
    </footer>
  )
}
