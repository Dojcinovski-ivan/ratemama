import type { Metadata } from 'next'
import RegisterForm from './register-form'

export const metadata: Metadata = {
  title: 'Create your account | RateMama',
  description: 'Join RateMama and help real families decide what is worth buying.',
}

export default function RegisterPage() {
  return <RegisterForm />
}
