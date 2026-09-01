/** Options for the three onboarding questions. */

export const HOUSEHOLD_TYPES = [
  { value: 'just_me', label: 'Just me' },
  { value: 'me_and_partner', label: 'Me and a partner' },
  { value: 'baby_toddler', label: 'Family with a baby or toddler under 3' },
  { value: 'young_kids', label: 'Family with young kids 3 to 10' },
  { value: 'older_kids', label: 'Family with older kids 10 plus' },
  { value: 'mixed_ages', label: 'Mixed ages' },
] as const

export const SHOPPING_CATEGORIES = [
  { value: 'baby_toddler_food', label: 'Baby and toddler food' },
  { value: 'kids_snacks_cereals', label: 'Kids snacks and cereals' },
  { value: 'family_meals', label: 'Family meals and cooking' },
  { value: 'household_cleaning', label: 'Household and cleaning products' },
  { value: 'health_beauty', label: 'Health and beauty' },
] as const

export const SUPERMARKETS = [
  { value: 'tesco', label: 'Tesco' },
  { value: 'sainsburys', label: 'Sainsburys' },
  { value: 'asda', label: 'Asda' },
  { value: 'lidl', label: 'Lidl' },
  { value: 'aldi', label: 'Aldi' },
  { value: 'waitrose', label: 'Waitrose' },
  { value: 'ocado', label: 'Ocado' },
  { value: 'mix', label: 'Mix of everything' },
] as const

export const HOUSEHOLD_VALUES = HOUSEHOLD_TYPES.map((o) => o.value) as string[]
export const CATEGORY_VALUES = SHOPPING_CATEGORIES.map((o) => o.value) as string[]
export const SUPERMARKET_VALUES = SUPERMARKETS.map((o) => o.value) as string[]

/**
 * Optional, and deliberately not just two choices. Nobody is required to
 * answer: skipping the step and choosing prefer not to say both store
 * nothing that affects what is shown.
 */
export const GENDER_OPTIONS = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'non_binary', label: 'Non binary' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const

export const GENDER_VALUES = GENDER_OPTIONS.map((o) => o.value) as string[]
