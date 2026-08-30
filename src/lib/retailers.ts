/**
 * Where to buy links.
 *
 * These are plain search links to each retailer for now. When the Awin
 * publisher id and advertiser approvals are in place, only buildLink
 * needs to change: every caller goes through it.
 */

export type Retailer = { value: string; label: string; search: (term: string) => string }

export const RETAILERS: Retailer[] = [
  {
    value: 'tesco',
    label: 'Tesco',
    search: (t) => `https://www.tesco.com/groceries/en-GB/search?query=${encodeURIComponent(t)}`,
  },
  {
    value: 'sainsburys',
    label: 'Sainsburys',
    search: (t) =>
      `https://www.sainsburys.co.uk/gol-ui/SearchResults/${encodeURIComponent(t)}`,
  },
  {
    value: 'asda',
    label: 'Asda',
    search: (t) => `https://groceries.asda.com/search/${encodeURIComponent(t)}`,
  },
  {
    value: 'waitrose',
    label: 'Waitrose',
    search: (t) =>
      `https://www.waitrose.com/ecom/shop/search?&searchTerm=${encodeURIComponent(t)}`,
  },
  {
    value: 'ocado',
    label: 'Ocado',
    search: (t) => `https://www.ocado.com/search?entry=${encodeURIComponent(t)}`,
  },
]

const AWIN_ID = process.env.AWIN_PUBLISHER_ID

/** Single place an affiliate wrapper gets added later. */
export function buildLink(retailer: Retailer, term: string): string {
  const direct = retailer.search(term)
  if (!AWIN_ID) return direct
  return direct
}

export function retailersFor(preferred: string[] | null | undefined): Retailer[] {
  if (!preferred || preferred.length === 0) return RETAILERS
  const chosen = RETAILERS.filter((r) => preferred.includes(r.value))
  return chosen.length > 0 ? chosen : RETAILERS
}
