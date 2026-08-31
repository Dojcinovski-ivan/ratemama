import type { MetadataRoute } from 'next'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ratemama.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/feed',
        '/friends',
        '/profile/edit',
        '/settings',
        '/notifications',
        '/onboarding',
        '/auth/',
        '/api/',
        '/unsubscribe',
      ],
    },
    sitemap: `${SITE}/sitemap.xml`,
  }
}
