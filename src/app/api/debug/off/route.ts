import { NextResponse } from 'next/server'
import { fetchProductsForCategories } from '@/lib/openfoodfacts'
import { createAdminClient } from '@/lib/supabase/admin'

/** Temporary diagnostic: exercise the real deck build path and report errors. */
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const categories = (new URL(request.url).searchParams.get('categories') ?? 'family_meals').split(
    ','
  )
  const steps: Record<string, unknown> = { categories }

  try {
    const started = Date.now()
    const found = await fetchProductsForCategories(categories, 10)
    steps.fetchMs = Date.now() - started
    steps.foundCount = found.length
    steps.sample = found.slice(0, 2).map((p) => ({ off_id: p.off_id, name: p.name, slug: p.slug }))

    if (found.length === 0) {
      steps.conclusion = 'fetch returned nothing'
      return NextResponse.json(steps)
    }

    const admin = createAdminClient()
    steps.adminClient = 'created'

    const { error: upsertError, count } = await admin.from('products').upsert(
      found.map((p) => ({
        off_id: p.off_id,
        name: p.name,
        brand: p.brand,
        category: p.category,
        image_url: p.image_url,
        barcode: p.barcode,
        slug: p.slug,
        country_availability: ['United Kingdom'],
        supermarkets: ['tesco'],
      })),
      { onConflict: 'off_id', ignoreDuplicates: false, count: 'exact' }
    )

    steps.upsertError = upsertError
      ? { message: upsertError.message, code: upsertError.code, details: upsertError.details }
      : null
    steps.upsertCount = count

    const { data: rows, error: readError } = await admin
      .from('products')
      .select('id, name')
      .in(
        'off_id',
        found.map((p) => p.off_id)
      )
    steps.readError = readError?.message ?? null
    steps.rowsBack = rows?.length ?? 0

    return NextResponse.json(steps)
  } catch (error) {
    steps.threw = error instanceof Error ? error.message : String(error)
    return NextResponse.json(steps)
  }
}
