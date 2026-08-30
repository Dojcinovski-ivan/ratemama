import { NextResponse } from 'next/server'

/**
 * Temporary diagnostic: can this deployment reach Open Food Facts?
 * Returns no secrets, only reachability and shape of the response.
 */
export const dynamic = 'force-dynamic'

export async function GET() {
  const tag = 'en:prepared-meals'
  const url =
    `https://world.openfoodfacts.org/api/v2/search?categories_tags=${tag}` +
    `&countries_tags_en=United%20Kingdom&fields=code,product_name,image_front_url` +
    `&sort_by=popularity_key&page_size=5`

  const started = Date.now()

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'RateMama/1.0 (https://ratemama.com)', Accept: 'application/json' },
      cache: 'no-store',
    })

    const ms = Date.now() - started
    const contentType = response.headers.get('content-type') ?? 'none'
    const body = await response.text()

    let productCount: number | string = 'not json'
    if (contentType.includes('json')) {
      try {
        productCount = (JSON.parse(body).products ?? []).length
      } catch {
        productCount = 'parse failed'
      }
    }

    return NextResponse.json({
      ok: response.ok,
      status: response.status,
      ms,
      contentType,
      productCount,
      bodyStart: body.slice(0, 200),
    })
  } catch (error) {
    return NextResponse.json({
      ok: false,
      threw: true,
      ms: Date.now() - started,
      message: error instanceof Error ? error.message : String(error),
    })
  }
}
