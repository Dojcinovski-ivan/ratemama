import Link from 'next/link'

export function Footer() {
  return (
    <footer className="mt-16 border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-app px-5 py-10 sm:max-w-3xl">
        <p className="text-lg font-bold text-worth">RateMama</p>
        <p className="mt-1 text-sm text-neutral-600">Real ratings from real families</p>

        <nav className="mt-6 flex flex-wrap gap-x-6 gap-y-3" aria-label="Footer">
          {[
            { href: '/discover', label: 'Discover' },
            { href: '/register', label: 'Join free' },
            { href: '/privacy', label: 'Privacy Policy' },
            { href: '/terms', label: 'Terms' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-6 flex gap-3">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="RateMama on Instagram"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 text-neutral-600"
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
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 text-neutral-600"
          >
            <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="currentColor">
              <path d="M17.5 3h3l-6.6 7.5L21.7 21h-6l-4.7-6.1L5.6 21h-3l7-8L2.6 3h6.2l4.2 5.6zm-1 16h1.6L7.6 4.7H5.9z" />
            </svg>
          </a>
        </div>

        <p className="mt-8 text-xs leading-relaxed text-neutral-500">
          RateMama is a community platform. Ratings are from real members not sponsored reviewers.
        </p>
        <p className="mt-2 text-xs text-neutral-400">Copyright 2026 RateMama</p>
      </div>
    </footer>
  )
}
