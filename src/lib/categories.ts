/** Onboarding categories mapped to the Open Food Facts style tags we store. */

export const CATEGORY_FILTERS = [
  {
    value: 'baby_toddler_food',
    label: 'Baby and toddler food',
    tags: ['en:baby-foods', 'en:baby-milks'],
  },
  {
    value: 'kids_snacks_cereals',
    label: 'Kids snacks and cereals',
    tags: ['en:breakfast-cereals', 'en:biscuits', 'en:snacks', 'en:crisps', 'en:chocolates'],
  },
  {
    value: 'family_meals',
    label: 'Family meals and cooking',
    tags: [
      'en:prepared-meals',
      'en:pastas',
      'en:sauces',
      'en:soups',
      'en:pizzas',
      'en:canned-foods',
      'en:frozen-foods',
    ],
  },
  {
    value: 'household_cleaning',
    label: 'Household and cleaning',
    tags: ['en:household'],
  },
  {
    value: 'health_beauty',
    label: 'Health and beauty',
    tags: ['en:beauty'],
  },
  {
    value: 'fridge_cupboard',
    label: 'Fridge and cupboard',
    tags: [
      'en:cheeses',
      'en:yogurts',
      'en:milks',
      'en:breads',
      'en:beverages',
      'en:fruit-juices',
      'en:groceries',
    ],
  },
] as const

export const CATEGORY_VALUES_LIST = CATEGORY_FILTERS.map((c) => c.value) as string[]

export function tagsForFilters(values: string[]): string[] {
  const tags = values.flatMap(
    (v) => (CATEGORY_FILTERS.find((c) => c.value === v)?.tags as readonly string[] | undefined) ?? []
  )
  return Array.from(new Set(tags))
}

/** Human label for a stored tag, used by the category badge. */
const TAG_LABELS: Record<string, string> = {
  'en:baby-foods': 'Baby and toddler food',
  'en:baby-milks': 'Baby milk',
  'en:breakfast-cereals': 'Breakfast cereals',
  'en:biscuits': 'Biscuits',
  'en:snacks': 'Snacks',
  'en:crisps': 'Crisps',
  'en:chocolates': 'Chocolate',
  'en:prepared-meals': 'Family meals',
  'en:pastas': 'Pasta and noodles',
  'en:sauces': 'Sauces',
  'en:soups': 'Soups',
  'en:pizzas': 'Pizza',
  'en:canned-foods': 'Tins and jars',
  'en:frozen-foods': 'Frozen',
  'en:cheeses': 'Cheese',
  'en:yogurts': 'Yoghurt',
  'en:milks': 'Milk',
  'en:breads': 'Bread and bakery',
  'en:beverages': 'Drinks',
  'en:fruit-juices': 'Juice',
  'en:groceries': 'Groceries',
  'en:household': 'Household and cleaning',
  'en:beauty': 'Health and beauty',
}

export function categoryLabel(tag: string | null | undefined) {
  if (!tag) return 'Groceries'
  return TAG_LABELS[tag] ?? tag.replace(/^en:/, '').replace(/-/g, ' ')
}
