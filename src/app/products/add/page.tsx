import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Screen } from '@/components/ui'
import { AddProductForm } from './add-form'

export const metadata = { title: 'Add a product | RateMama' }
export const dynamic = 'force-dynamic'

export default async function AddProductPage({
  searchParams,
}: {
  searchParams: { barcode?: string }
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/products/add')

  return (
    <Screen>
      <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Add a product</h1>
      <p className="mt-2 text-base leading-relaxed text-neutral-600">
        We do not have this one yet. Add it and you can be the first to review it.
      </p>

      <div className="mt-6">
        <AddProductForm barcode={searchParams.barcode ?? ''} />
      </div>
      <div className="h-12" />
    </Screen>
  )
}
