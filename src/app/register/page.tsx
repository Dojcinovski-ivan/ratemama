import { redirect } from 'next/navigation'

/**
 * Signing up now happens at the end of onboarding rather than the start,
 * so this old entry point sends people to the first question.
 */
export default function RegisterRedirect() {
  redirect('/onboarding/household')
}
