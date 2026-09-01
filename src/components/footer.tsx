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
