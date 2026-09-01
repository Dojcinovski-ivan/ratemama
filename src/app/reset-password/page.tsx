import type { Metadata } from 'next'
import ResetForm from './reset-form'

export const metadata: Metadata = {
  title: 'Choose a new password | RateMama',
  robots: { index: false, follow: false },
}

export default function ResetPasswordPage() {
  return <ResetForm />
}
