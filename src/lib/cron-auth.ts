/**
 * Cron endpoints send email, so they must not be triggerable by anyone
 * who guesses the URL. Vercel sends the CRON_SECRET as a bearer token.
 */
export function cronAuthorised(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return request.headers.get('authorization') === `Bearer ${secret}`
}
