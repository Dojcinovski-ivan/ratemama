/**
 * Onboarding answers are collected before there is an account, so they
 * live in the browser until one exists. Everything is namespaced and
 * cleared the moment it reaches the database.
 */

const KEY = 'ratemama_onboarding'

export type SwipeAnswer = { productId: string; response: string }

export type OnboardingDraft = {
  household?: string
  categories?: string[]
  supermarkets?: string[]
  swipes?: SwipeAnswer[]
  firstName?: string
  email?: string
  city?: string
  country?: string
}

export function readDraft(): OnboardingDraft {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? '{}') as OnboardingDraft
  } catch {
    return {}
  }
}

export function writeDraft(patch: Partial<OnboardingDraft>) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ ...readDraft(), ...patch }))
  } catch {
    // A private window with storage disabled should not break the flow.
  }
}

export function clearDraft() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(KEY)
  } catch {
    // Nothing to do.
  }
}

/** Steps in order, so the progress bar and the back button agree. */
export const ONBOARDING_STEPS = [
  '/onboarding/household',
  '/onboarding/categories',
  '/onboarding/supermarkets',
  '/onboarding/swipe',
  '/onboarding/name',
  '/onboarding/email',
  '/onboarding/location',
  '/onboarding/password',
] as const

export const TOTAL_STEPS = ONBOARDING_STEPS.length
