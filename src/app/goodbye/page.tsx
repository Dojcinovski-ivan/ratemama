import Link from 'next/link'
import { Button, Screen } from '@/components/ui'

export const metadata = {
  title: 'Your account is deleted | RateMama',
  robots: { index: false, follow: false },
}

export default function GoodbyePage() {
  return (
    <Screen className="justify-center">
      <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
        Your account is deleted.
      </h1>
      <p className="mt-3 text-base leading-relaxed text-neutral-600">
        Your ratings, saved products, photos and profile have all been removed. Nothing of yours is
        left on RateMama.
      </p>
      <p className="mt-4 text-base leading-relaxed text-neutral-600">
        If you ever want to come back you are welcome any time, and you would start fresh.
      </p>
      <div className="mt-8">
        <Link href="/" className="block">
          <Button variant="secondary">Back to RateMama</Button>
        </Link>
      </div>
    </Screen>
  )
}
