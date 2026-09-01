/**
 * Static content for the landing page.
 *
 * Nothing here is attributed to a person. There are no invented members,
 * no invented quotes and no invented helpful counts. The one sample below
 * exists to show the shape of a rating and is labelled as a sample
 * wherever it appears. Real ratings replace it once there are enough of
 * them to be worth showing.
 */

/** Shows the format of a rating. Deliberately has no author. */
export const SAMPLE_RATING = {
  product: 'Heinz Baked Beanz 415g',
  rating: 'worth_it' as const,
  price: '£0.95',
  shop: 'Tesco',
  reason:
    'A rating says what you paid, where you bought it, and whether you would buy it again. That is the whole thing.',
}

/** How many real ratings before the landing page shows them instead. */
export const MIN_REAL_RATINGS = 6

export const MEANINGS = [
  {
    kind: 'worth_it' as const,
    title: 'Worth It',
    body: 'It does what it promises at a price you would happily pay again. Might be a brand, might be the own brand version that costs half as much.',
  },
  {
    kind: 'not_worth_it' as const,
    title: 'Not Worth It',
    body: 'Overpriced, underwhelming, or the cheaper alternative does exactly the same job. The rating says why, so you can judge for yourself.',
  },
]

export const STEPS = [
  {
    title: 'Sign up and tell us what you buy',
    body: 'Takes 30 seconds. Tell us your household, what you shop for and where you usually shop. We use this to show you the most relevant ratings.',
    image:
      'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=1200&q=70',
    alt: 'A bright family kitchen',
  },
  {
    title: 'See what families honestly think',
    body: 'Every product gets a clear Worth It or Not Worth It rating from real families. See exactly what they paid, where they bought it and why they feel that way.',
    image:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=70',
    alt: 'A supermarket aisle',
  },
  {
    title: 'Share your rating and help the next family',
    body: 'Bought something recently? Rate it in 60 seconds. Your rating goes live immediately and helps families make better decisions.',
    image:
      'https://images.unsplash.com/photo-1584680226833-0d680d0a0794?auto=format&fit=crop&w=1200&q=70',
    alt: 'A weekly shop laid out on a table',
  },
]

export const CATEGORIES = [
  { emoji: '🍼', label: 'Baby and toddler food', href: '/discover?c=baby_toddler_food' },
  { emoji: '🥣', label: 'Kids snacks and cereals', href: '/discover?c=kids_snacks_cereals' },
  { emoji: '🍝', label: 'Family meals and cooking', href: '/discover?c=family_meals' },
  { emoji: '🧴', label: 'Household and cleaning', href: '/discover?c=household_cleaning' },
  { emoji: '🧼', label: 'Health and beauty', href: '/discover?c=health_beauty' },
  { emoji: '🛒', label: 'Everything else', href: '/discover' },
]
