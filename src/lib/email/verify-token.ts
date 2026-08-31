import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Email verification links have to work from an inbox with no session,
 * so the token is an HMAC of the user id rather than a stored secret.
 * It cannot be guessed, and it cannot be edited to verify somebody else.
 */
function secret() {
  const value = process.env.UNSUBSCRIBE_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!value) throw new Error('No secret available for verification tokens')
  return value
}

export function signVerification(userId: string): string {
  const mac = createHmac('sha256', secret()).update(`verify:${userId}`).digest('hex').slice(0, 32)
  return `${userId}.${mac}`
}

export function verifyVerification(token: string): string | null {
  const [userId, mac] = token.split('.')
  if (!userId || !mac) return null

  const expected = createHmac('sha256', secret())
    .update(`verify:${userId}`)
    .digest('hex')
    .slice(0, 32)

  const a = Buffer.from(mac)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return null

  return timingSafeEqual(a, b) ? userId : null
}

export function verificationUrl(userId: string): string {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ratemama.com'
  return `${site}/auth/verify?token=${encodeURIComponent(signVerification(userId))}`
}
