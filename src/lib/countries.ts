/**
 * Country list for the signup form.
 * The five most common for our users sit at the top, then the rest
 * alphabetically. Kept as a flat list so the select stays simple.
 */

export const PINNED_COUNTRIES = [
  'United Kingdom',
  'Germany',
  'United States',
  'Australia',
  'Canada',
] as const

export const OTHER_COUNTRIES = [
  'Austria',
  'Belgium',
  'Brazil',
  'Bulgaria',
  'Croatia',
  'Cyprus',
  'Czechia',
  'Denmark',
  'Estonia',
  'Finland',
  'France',
  'Greece',
  'Hungary',
  'Iceland',
  'India',
  'Ireland',
  'Italy',
  'Japan',
  'Latvia',
  'Lithuania',
  'Luxembourg',
  'Malta',
  'Mexico',
  'Netherlands',
  'New Zealand',
  'Norway',
  'Poland',
  'Portugal',
  'Romania',
  'Singapore',
  'Slovakia',
  'Slovenia',
  'South Africa',
  'Spain',
  'Sweden',
  'Switzerland',
  'Turkey',
  'United Arab Emirates',
] as const

export const ALL_COUNTRIES: string[] = [...PINNED_COUNTRIES, ...OTHER_COUNTRIES]

export function isValidCountry(value: string): boolean {
  return ALL_COUNTRIES.includes(value)
}
