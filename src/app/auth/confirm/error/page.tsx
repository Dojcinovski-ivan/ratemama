import Link from 'next/link'
import { Screen, Button } from '@/components/ui'

const MESSAGES: Record<string, { heading: string; body: string }> = {
  expired: {
    heading: 'That link has expired.',
    body: 'Confirmation links are only good for a short while. Send yourself a fresh one and you will be in shortly.',
  },
  invalid: {
    heading: 'That link did not work.',
    body: 'It may have already been used, or the address got cut short by your email app. A new link will sort it out.',
  },
  missing: {
    heading: 'Something was missing from that link.',
    body: 'It looks like part of the address did not come through. Ask for a new link and try once more.',
  },
}

export default function ConfirmErrorPage({
  searchParams,
}: {
  searchParams: { reason?: string }
}) {
  const { heading, body } = MESSAGES[searchParams.reason ?? 'invalid'] ?? MESSAGES.invalid

  return (
    <Screen className="justify-center">
      <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{heading}</h1>
      <p className="mt-3 text-base leading-relaxed text-neutral-600">{body}</p>

      <div className="mt-8 space-y-3">
        <Link href="/register/check-email" className="block">
          <Button>Send me a new link</Button>
        </Link>
        <Link href="/login" className="block">
          <Button variant="secondary">Back to log in</Button>
        </Link>
      </div>

      <p className="mt-8 text-sm text-neutral-500">
        Still stuck? Reply to any RateMama email and a real person will help.
      </p>
    </Screen>
  )
}
