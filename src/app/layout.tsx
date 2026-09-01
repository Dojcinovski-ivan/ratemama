import type { Metadata, Viewport } from 'next'
import { Nav } from '@/components/nav'
import { CookieBanner } from '@/components/cookie-banner'
import { Analytics } from '@/components/analytics'
import { serif, sans } from './fonts'
import './globals.css'

export const metadata: Metadata = {
  title: 'RateMama',
  description: 'Real ratings from real parents on what is worth buying.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ratemama.com'),
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>
        {/* Nav reads the session in the browser so this layout stays
            static and public product pages remain cacheable for search. */}
        <Nav />
        <div className="pb-20 sm:pb-0">{children}</div>
        <CookieBanner />
        <Analytics />
      </body>
    </html>
  )
}
