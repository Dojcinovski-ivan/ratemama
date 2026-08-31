import { redirect } from 'next/navigation'

/** Onboarding always begins at the first question. */
export default function OnboardingIndex() {
  redirect('/onboarding/household')
}
