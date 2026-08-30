import Link from 'next/link'
import { Button, Screen } from '@/components/ui'

export default function Home() {
  return (
    <Screen className="justify-center">
      <p className="text-lg font-bold text-worth">RateMama</p>

      <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-neutral-900">
        Is it actually worth it?
      </h1>

      <p className="mt-4 text-lg leading-relaxed text-neutral-600">
        Real verdicts from real parents on what is worth buying and what is not.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-worth px-4 py-5 text-worth-fg">
          <p className="text-sm font-semibold uppercase tracking-wide opacity-90">Worth It</p>
        </div>
        <div className="rounded-2xl bg-notworth px-4 py-5 text-notworth-fg">
          <p className="text-sm font-semibold uppercase tracking-wide opacity-90">Not Worth It</p>
        </div>
      </div>

      <div className="mt-10 space-y-3">
        <Link href="/register" className="block">
          <Button>Join RateMama</Button>
        </Link>
        <Link href="/login" className="block">
          <Button variant="secondary">Log in</Button>
        </Link>
      </div>

      <p className="mt-8 text-sm leading-relaxed text-neutral-500">
        Join now and you become a founding member.
      </p>
    </Screen>
  )
}
