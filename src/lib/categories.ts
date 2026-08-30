/** Onboarding categories mapped to the Open Food Facts tags we store. */

export const CATEGORY_FILTERS = [
  { value: 'baby_toddler_food', label: 'Baby and toddler food', tags: ['en:baby-foods', 'en:baby-milks'] },
  { value: 'kids_snacks_cereals', label: 'Kids snacks and cereals', tags: ['en:breakfast-cereals', 'en:biscuits'] },
  { value: 'family_meals', label: 'Family meals', tags: ['en:prepared-meals', 'en:pastas'] },
  { value: 'household_cleaning', label: 'Household and cleaning', tags: ['en:household'] },
  { value: 'health_beauty', label: 'Health and beauty', tags: ['en:beauty'] },
] as const

export const CATEGORY_VALUES_LIST = CATEGORY_FILTERS.map((c) => c.value) as string[]

export function tagsForFilters(values: string[]): string[] {
  const tags = values.flatMap((v) => CATEGORY_FILTERS.find((c) => c.value === v)?.tags ?? [])
  return Array.from(new Set(tags))
}

/** Human label for a stored Open Food Facts tag, for the category badge. */
const TAG_LABELS: Record<string, string> = {
  'en:baby-foods': 'Baby and toddler food',
  'en:baby-milks': 'Baby milk',
  'en:breakfast-cereals': 'Breakfast cereals',
  'en:biscuits': 'Biscuits',
  'en:prepared-meals': 'Family meals',
  'en:pastas': 'Pasta and noodles',
  'en:groceries': 'Groceries',
  'en:household': 'Household and cleaning',
  'en:beauty': 'Health and beauty',
}

export function categoryLabel(tag: string | null | undefined) {
  if (!tag) return 'Groceries'
  return TAG_LABELS[tag] ?? tag.replace(/^en:/, '').replace(/-/g, ' ')
}
