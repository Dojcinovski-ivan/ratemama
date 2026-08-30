import { Screen } from '@/components/ui'

export const metadata = { title: 'Friends | RateMama' }

export default function FriendsPage() {
  return (
    <Screen>
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Friends</h1>
      <p className="mt-3 text-base leading-relaxed text-neutral-600">
        Following other families is on its way. Soon you will be able to see verdicts from people
        whose taste you trust.
      </p>
    </Screen>
  )
}
