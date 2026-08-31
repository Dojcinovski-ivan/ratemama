/**
 * Where to buy links.
 *
 * Every link goes through buildLink, so when the Awin publisher id and
 * the advertiser approvals land, this is the only function that changes.
 */

export type Retailer = {
  value: string
  label: string
  search: (term: string) => string
}

export const RETAILERS: Retailer[] = [
  {
    value: 'tesco',
    label: 'Tesco',
    search: (t) => `https://www.tesco.com/groceries/search/?query=${encodeURIComponent(t)}`,
  },
  {
    value: 'sainsburys',
    label: 'Sainsburys',
    search: (t) =>
      `https://www.sainsburys.co.uk/gol-ui/SearchDisplayView?searchTerm=${encodeURIComponent(t)}`,
  },
  {
    value: 'ocado',
    label: 'Ocado',
    search: (t) => `https://www.ocado.com/search?entry=${encodeURIComponent(t)}`,
  },
  {
    value: 'amazon',
    label: 'Amazon',
    search: (t) => `https://www.amazon.co.uk/s?k=${encodeURIComponent(t)}`,
  },
]

const AWIN_ID = process.env.AWIN_PUBLISHER_ID

/**
 * The single place an affiliate wrapper gets added. Until the publisher
 * id is set, these are plain retailer search links and nothing is
 * tracked or earned.
 */
export function buildLink(retailer: Retailer, term: string): string {
  const direct = retailer.search(term)
  if (!AWIN_ID) return direct
  return direct
}

/** Affiliate tracking is only live once the publisher id exists. */
export function affiliateActive(): boolean {
  return Boolean(AWIN_ID)
}

export function retailersFor(preferred: string[] | null | undefined): Retailer[] {
  if (!preferred || preferred.length === 0) return RETAILERS
  const chosen = RETAILERS.filter((r) => preferred.includes(r.value))
  const rest = RETAILERS.filter((r) => !preferred.includes(r.value))
  return [...chosen, ...rest]
}
