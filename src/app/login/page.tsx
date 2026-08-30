import type { Metadata } from 'next'
import LoginForm from './login-form'

export const metadata: Metadata = {
  title: 'Log in | RateMama',
  description: 'Log in to RateMama.',
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string }
}) {
  return <LoginForm next={searchParams.next} oauthError={searchParams.error === 'oauth'} />
}
