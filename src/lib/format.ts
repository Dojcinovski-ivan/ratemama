export function formatPrice(value: number | null | undefined, currency = 'GBP') {
  if (value == null) return null
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(value)
}

/** Warm relative time. Deliberately vague past a week. */
export function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`
  return new Date(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

const SUPERMARKET_LABELS: Record<string, string> = {
  tesco: 'Tesco',
  sainsburys: 'Sainsburys',
  asda: 'Asda',
  lidl: 'Lidl',
  aldi: 'Aldi',
  waitrose: 'Waitrose',
  ocado: 'Ocado',
  other: 'Somewhere else',
}

export function supermarketLabel(value: string) {
  return SUPERMARKET_LABELS[value] ?? value
}
