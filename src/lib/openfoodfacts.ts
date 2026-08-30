/**
 * Open Food Facts lookup for the onboarding swipe deck.
 *
 * Notes on the source:
 *  - We use the v2 search API. The older cgi/search.pl is slow and heavily
 *    rate limited.
 *  - Open Food Facts is a food database. It holds nothing useful for
 *    household cleaning or health and beauty, so those categories fall back
 *    to broad UK groceries rather than returning an empty deck.
 *  - There is no price data in Open Food Facts at all, so average_price_gbp
 *    stays null until we have real figures.
 *  - They ask for a descriptive User Agent. Sending one keeps us in good
 *    standing and avoids being throttled.
 */

const SEARCH_URL = 'https://world.openfoodfacts.org/api/v2/search'
const USER_AGENT = 'RateMama/1.0 (https://ratemama.com)'

/** Onboarding category to Open Food Facts category tags. */
const CATEGORY_TAGS: Record<string, string[]> = {
  baby_toddler_food: ['en:baby-foods', 'en:baby-milks'],
  kids_snacks_cereals: ['en:breakfast-cereals', 'en:biscuits'],
  family_meals: ['en:prepared-meals', 'en:pastas'],
  // Not covered by Open Food Facts. Fall back to broad groceries so the
  // deck still fills rather than showing nothing.
  household_cleaning: ['en:groceries'],
  health_beauty: ['en:groceries'],
}

const FALLBACK_TAGS = ['en:groceries']

export type OffProduct = {
  off_id: string
  name: string
  brand: string | null
  category: string
  image_url: string
  barcode: string | null
  slug: string
}

type OffApiProduct = {
  code?: string
  product_name?: string
  product_name_en?: string
  brands?: string
  image_front_url?: string
  image_url?: string
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70)
}

function tagsFor(categories: string[]): string[] {
  const tags = categories.flatMap((c) => CATEGORY_TAGS[c] ?? [])
  return tags.length > 0 ? Array.from(new Set(tags)) : FALLBACK_TAGS
}

const MAX_ATTEMPTS = 3
const REQUEST_TIMEOUT_MS = 6000

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Open Food Facts returns 503 a large fraction of the time. Measured at
 * roughly six failures in ten during testing. A single attempt therefore
 * loses the deck far too often, so every request is retried with backoff
 * and failures are logged rather than swallowed.
 */
async function fetchOneCategory(tag: string, pageSize: number): Promise<OffProduct[]> {
  const params = new URLSearchParams({
    categories_tags: tag,
    countries_tags_en: 'United Kingdom',
    fields: 'code,product_name,product_name_en,brands,image_front_url,image_url',
    sort_by: 'popularity_key',
    page_size: String(pageSize),
  })
  const url = `${SEARCH_URL}?${params}`

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        // Cache successes for a day. Failures are never cached, so a retry
        // always reaches the network.
        next: { revalidate: 86400 },
      })

      if (!response.ok) {
        console.warn(`[off] ${tag} attempt ${attempt} returned ${response.status}`)
        if (attempt < MAX_ATTEMPTS) await wait(attempt * 400)
        continue
      }

      const json = (await response.json()) as { products?: OffApiProduct[] }
      return mapProducts(json.products ?? [], tag)
    } catch (error) {
      console.warn(
        `[off] ${tag} attempt ${attempt} threw:`,
        error instanceof Error ? error.message : error
      )
      if (attempt < MAX_ATTEMPTS) await wait(attempt * 400)
    }
  }

  console.error(`[off] ${tag} failed after ${MAX_ATTEMPTS} attempts`)
  return []
}

function mapProducts(products: OffApiProduct[], tag: string): OffProduct[] {
  return products
    .map((p): OffProduct | null => {
      const name = (p.product_name_en || p.product_name || '').trim()
      const image = p.image_front_url || p.image_url || ''
      const code = (p.code || '').trim()

      // Every card needs a clear image and a real name, so anything
      // missing either is dropped rather than shown half empty.
      if (!code || !name || !image) return null

      const brand = (p.brands || '').split(',')[0]?.trim() || null

      return {
        off_id: code,
        name,
        brand,
        category: tag,
        image_url: image,
        barcode: /^\d{8,14}$/.test(code) ? code : null,
        slug: slugify([brand, name].filter(Boolean).join(' ')) || slugify(name) || code,
      }
    })
    .filter((p): p is OffProduct => p !== null)
}

/** Open Food Facts category tags matching the user's chosen categories. */
export function tagsForCategories(categories: string[]): string[] {
  return tagsFor(categories)
}

/** Fetches a deck of products for the given onboarding categories. */
export async function fetchProductsForCategories(
  categories: string[],
  limit = 10
): Promise<OffProduct[]> {
  const tags = tagsFor(categories)
  const perTag = Math.max(4, Math.ceil((limit * 2) / tags.length))

  const results = await Promise.all(tags.map((tag) => fetchOneCategory(tag, perTag)))

  const seen = new Set<string>()
  const deck: OffProduct[] = []

  // Interleave the categories so the deck is not all one type up front.
  const maxLength = Math.max(0, ...results.map((r) => r.length))
  for (let i = 0; i < maxLength && deck.length < limit; i++) {
    for (const list of results) {
      const product = list[i]
      if (!product || seen.has(product.off_id) || deck.length >= limit) continue
      seen.add(product.off_id)
      deck.push(product)
    }
  }

  return deck
}
