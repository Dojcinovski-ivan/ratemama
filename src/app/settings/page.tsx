import { Screen } from '@/components/ui'
import { CookieChoice } from './cookie-choice'

export const metadata = { title: 'Settings | RateMama' }

export default function Page() {
  return (
    <Screen>
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Settings</h1>
      <p className="mt-3 text-base leading-relaxed text-neutral-600">
        More is on its way. For now you can change your cookie choice here.
      </p>
      <CookieChoice />
    </Screen>
  )
}
