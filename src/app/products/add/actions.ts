'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { slugify } from '@/lib/openfoodfacts'
import { CATEGORY_FILTERS } from '@/lib/categories'

export type AddState = { error?: string; slug?: string }

const SHOPS = [
  'tesco', 'sainsburys', 'asda', 'lidl', 'aldi',
  'waitrose', 'ocado', 'amazon', 'other',
]

export async function addProduct(_prev: AddState, formData: FormData): Promise<AddState> {
  const name = String(formData.get('name') ?? '').trim()
  const brand = String(formData.get('brand') ?? '').trim()
  const category = String(formData.get('category') ?? '')
  const barcode = String(formData.get('barcode') ?? '').replace(/\D/g, '')
  const supermarket = String(formData.get('supermarket') ?? '')
  const price = String(formData.get('price') ?? '').trim()
  const photoUrl = String(formData.get('photo_url') ?? '').trim()

  if (!name) return { error: 'Please add the product name.' }
  if (!brand) return { error: 'Please add the brand.' }

  const filter = CATEGORY_FILTERS.find((c) => c.value === category)
  if (!filter) return { error: 'Please choose a category.' }
  if (!SHOPS.includes(supermarket)) return { error: 'Please choose where you found it.' }

  const priceValue = Number(price)
  if (!price || Number.isNaN(priceValue) || priceValue < 0 || priceValue > 10000) {
    return { error: 'Please add roughly what it costs.' }
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Please log in to add a product.' }

  const admin = createAdminClient()

  if (barcode) {
    const { data: clash } = await admin
      .from('products')
      .select('slug')
      .or(`barcode.eq.${barcode},off_id.eq.${barcode}`)
      .maybeSingle()
    if (clash?.slug) return { slug: clash.slug }
  }

  let slug = slugify(`${brand} ${name}`) || slugify(name)
  if (!slug) return { error: 'Please use a name we can turn into a web address.' }

  const { data: slugClash } = await admin.from('products').select('id').eq('slug', slug).maybeSingle()
  if (slugClash) slug = `${slug}-${Math.random().toString(36).slice(2, 7)}`

  // off_id stays null for a product nobody imported from Open Food Facts.
  const { error } = await admin.from('products').insert({
    name,
    brand,
    category: filter.tags[0],
    barcode: barcode || null,
    slug,
    image_url: photoUrl || null,
    average_price_gbp: priceValue,
    supermarkets: [supermarket],
    country_availability: ['United Kingdom'],
    added_by: user.id,
  })

  if (error) {
    console.error('[add product] failed', error)
    return { error: 'We could not add that just then. Please try again.' }
  }

  return { slug }
}
