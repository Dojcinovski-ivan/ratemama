import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ratemama.com'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient()

  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at, total_ratings')
    .not('slug', 'is', null)
    .order('total_ratings', { ascending: false })
    .limit(5000)

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE}/discover`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE}/onboarding/household`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE}/login`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE}/terms`, changeFrequency: 'yearly', priority: 0.3 },
  ]

  const productPages: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url: `${SITE}/products/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
    changeFrequency: 'weekly' as const,
    priority: (p.total_ratings ?? 0) > 0 ? 0.8 : 0.6,
  }))

  return [...staticPages, ...productPages]
}
