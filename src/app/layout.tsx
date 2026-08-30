import type { Metadata, Viewport } from 'next'
import { Nav } from '@/components/nav'
import './globals.css'

export const metadata: Metadata = {
  title: 'RateMama',
  description: 'Real verdicts from real parents on what is worth buying.',
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
    <html lang="en">
      <body>
        {/* Nav reads the session in the browser so this layout stays
            static and public product pages remain cacheable for search. */}
        <Nav />
        <div className="pb-20 sm:pb-0">{children}</div>
      </body>
    </html>
  )
}
