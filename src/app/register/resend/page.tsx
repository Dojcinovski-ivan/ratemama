import type { Metadata } from 'next'
import ResendForm from './resend-form'

export const metadata: Metadata = {
  title: 'Send a new link | RateMama',
  robots: { index: false, follow: false },
}

export default function ResendPage({ searchParams }: { searchParams: { email?: string } }) {
  return <ResendForm initialEmail={searchParams.email} />
}
