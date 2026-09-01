/**
 * Cities offered as a dropdown, keyed by country.
 *
 * Only countries we have a list for appear as a select. Everywhere else
 * falls back to a text field, so signing up never depends on us having
 * covered someone's country. "Other" is always available for anyone
 * whose town is not listed.
 */

const UNITED_KINGDOM = [
  'Aberdeen', 'Aberystwyth', 'Aylesbury', 'Bangor', 'Barnsley', 'Basildon', 'Basingstoke',
  'Bath', 'Bedford', 'Belfast', 'Birkenhead', 'Birmingham', 'Blackburn', 'Blackpool',
  'Bolton', 'Bournemouth', 'Bracknell', 'Bradford', 'Brighton', 'Bristol', 'Burnley',
  'Burton upon Trent', 'Bury', 'Cambridge', 'Canterbury', 'Cardiff', 'Carlisle',
  'Chelmsford', 'Cheltenham', 'Chester', 'Chesterfield', 'Colchester', 'Coventry',
  'Crawley', 'Crewe', 'Croydon', 'Darlington', 'Derby', 'Doncaster', 'Dundee',
  'Dunfermline', 'Durham', 'Eastbourne', 'Edinburgh', 'Exeter', 'Falkirk', 'Gateshead',
  'Glasgow', 'Gloucester', 'Grimsby', 'Guildford', 'Halifax', 'Harlow', 'Harrogate',
  'Hartlepool', 'Hastings', 'Hemel Hempstead', 'Hereford', 'High Wycombe', 'Huddersfield',
  'Hull', 'Inverness', 'Ipswich', 'Kilmarnock', 'Kingston upon Thames', 'Lancaster',
  'Leeds', 'Leicester', 'Lincoln', 'Lisburn', 'Liverpool', 'Livingston', 'London',
  'Londonderry', 'Luton', 'Maidstone', 'Manchester', 'Mansfield', 'Middlesbrough',
  'Milton Keynes', 'Newcastle upon Tyne', 'Newport', 'Northampton', 'Norwich',
  'Nottingham', 'Nuneaton', 'Oldham', 'Oxford', 'Paisley', 'Perth', 'Peterborough',
  'Plymouth', 'Poole', 'Portsmouth', 'Preston', 'Reading', 'Redditch', 'Rochdale',
  'Rotherham', 'Salford', 'Scunthorpe', 'Sheffield', 'Shrewsbury', 'Slough', 'Solihull',
  'Southampton', 'Southend on Sea', 'Southport', 'St Albans', 'St Helens', 'Stevenage',
  'Stirling', 'Stockport', 'Stockton on Tees', 'Stoke on Trent', 'Sunderland', 'Sutton Coldfield',
  'Swansea', 'Swindon', 'Telford', 'Torquay', 'Wakefield', 'Walsall', 'Warrington',
  'Watford', 'Wigan', 'Winchester', 'Woking', 'Wolverhampton', 'Worcester', 'Worthing',
  'Wrexham', 'York',
] as const

const IRELAND = [
  'Cork', 'Drogheda', 'Dublin', 'Dundalk', 'Galway', 'Limerick', 'Waterford',
] as const

const CITIES_BY_COUNTRY: Record<string, readonly string[]> = {
  'United Kingdom': UNITED_KINGDOM,
  Ireland: IRELAND,
}

/** Always offered at the bottom of a city list. */
export const OTHER_CITY = 'Other'

export function citiesFor(country: string): readonly string[] | null {
  return CITIES_BY_COUNTRY[country] ?? null
}

export function hasCityList(country: string) {
  return citiesFor(country) !== null
}
