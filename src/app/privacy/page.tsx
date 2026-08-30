import { Screen } from '@/components/ui'

export const metadata = { title: 'Privacy Policy | RateMama' }

export default function PrivacyPage() {
  return (
    <Screen>
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Privacy Policy</h1>
      <p className="mt-3 text-base leading-relaxed text-neutral-600">
        Our full privacy policy is being written. In short: we keep your surname private, we never
        show it publicly, and we only email you marketing if you asked us to.
      </p>
    </Screen>
  )
}
