import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Unsubscribe links have to work from an inbox, with no session. The
 * token is an HMAC of the user id, so it cannot be guessed or edited to
 * unsubscribe somebody else.
 */
function secret() {
  const value = process.env.UNSUBSCRIBE_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!value) throw new Error('No secret available for unsubscribe tokens')
  return value
}

export function signUnsubscribe(userId: string): string {
  const mac = createHmac('sha256', secret()).update(userId).digest('hex').slice(0, 32)
  return `${userId}.${mac}`
}

export function verifyUnsubscribe(token: string): string | null {
  const [userId, mac] = token.split('.')
  if (!userId || !mac) return null

  const expected = createHmac('sha256', secret()).update(userId).digest('hex').slice(0, 32)
  const a = Buffer.from(mac)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return null

  return timingSafeEqual(a, b) ? userId : null
}

export function unsubscribeUrl(userId: string): string {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ratemama.com'
  return `${site}/unsubscribe?token=${encodeURIComponent(signUnsubscribe(userId))}`
}
