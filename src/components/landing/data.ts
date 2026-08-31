/**
 * Illustrative content for the landing page.
 *
 * These are examples of how a rating looks, not real member ratings.
 * Every place they appear is labelled as an example. They get replaced
 * by real ratings from the database as families join.
 */

export const EXAMPLE_RATINGS = [
  {
    product: "Sainsbury's Own Brand Baked Beans 420g",
    rating: 'worth_it' as const,
    price: '£0.45',
    shop: "Sainsbury's",
    person: 'Sarah M.',
    place: 'Manchester',
    initials: 'SM',
    reason:
      'Half the price of Heinz and honestly I cannot tell the difference. My kids eat them every week.',
    helpful: 47,
  },
  {
    product: "Ella's Kitchen Organic Fruit Pouch",
    rating: 'not_worth_it' as const,
    price: '£1.49',
    shop: 'Tesco',
    person: 'Emma R.',
    place: 'Bristol',
    initials: 'ER',
    reason: 'Too expensive for what it is. The Aldi version is just as good for half the price.',
    helpful: 32,
  },
  {
    product: 'Persil Non Bio Washing Liquid 888ml',
    rating: 'worth_it' as const,
    price: '£6.00',
    shop: 'Asda',
    person: 'James T.',
    place: 'London',
    initials: 'JT',
    reason: 'Always on offer somewhere. Works brilliantly for baby clothes, no skin reactions at all.',
    helpful: 28,
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

export const VOICES = [
  {
    quote:
      'I used to spend ages reading reviews that all felt fake. RateMama is just real people saying what they actually think. I have saved so much money on nappies alone.',
    person: 'Rachel K.',
    place: 'Leeds',
    photo:
      'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=200&q=70',
  },
  {
    quote:
      'We switched our whole weekly shop based on ratings we found here. The own brand recommendations are brilliant.',
    person: 'Tom and Priya S.',
    place: 'Birmingham',
    photo:
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=200&q=70',
  },
  {
    quote:
      'Finally somewhere I can trust. No sponsored content, no influencers. Just honest opinions from families like mine.',
    person: 'Claire M.',
    place: 'Edinburgh',
    photo:
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=200&q=70',
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
