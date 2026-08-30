import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'

const FROM = 'RateMama <hello@send.ratemama.com>'
const EMAIL_TYPE = 'welcome'

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ratemama.com'
}

function welcomeHtml(firstName: string) {
  const site = siteUrl()
  return `<!doctype html>
<html lang="en">
<body style="margin:0;background:#f6f6f4;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f4;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:20px;padding:32px;">
        <tr><td>
          <p style="margin:0 0 24px;font-size:18px;font-weight:700;color:#4CAF7D;">RateMama</p>

          <h1 style="margin:0 0 16px;font-size:28px;line-height:1.25;color:#171717;">You are in.</h1>

          <p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#404040;">
            ${firstName ? `Hi ${firstName},` : 'Hi,'}
          </p>

          <p style="margin:0 0 24px;font-size:16px;line-height:1.65;color:#404040;">
            You are one of our founding members. Every verdict you leave helps real
            families make better decisions. The community is just getting started and
            you are part of building it.
          </p>

          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
            <tr><td style="border-radius:14px;background:#4CAF7D;">
              <a href="${site}/onboarding"
                 style="display:inline-block;padding:14px 28px;font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;">
                Start exploring
              </a>
            </td></tr>
          </table>

          <hr style="border:none;border-top:1px solid #e5e5e5;margin:0 0 20px;" />

          <p style="margin:0;font-size:13px;line-height:1.6;color:#8a8a8a;">
            You are receiving this because you created a RateMama account.
            <a href="${site}/settings" style="color:#8a8a8a;">Unsubscribe</a>
            &nbsp;&middot;&nbsp;
            <a href="${site}/privacy" style="color:#8a8a8a;">Privacy Policy</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

/**
 * Sends the welcome email once per user.
 *
 * The sent_emails table has a unique constraint on (user_id, email_type),
 * so we claim the row first. If the insert conflicts the email already went
 * out and we do nothing, which makes a double click on the confirm link safe.
 */
export async function sendWelcomeEmail(userId: string, email: string, firstName: string) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[welcome] RESEND_API_KEY not set, skipping welcome email')
    return
  }

  const admin = createAdminClient()

  const { error: claimError } = await admin
    .from('sent_emails')
    .insert({ user_id: userId, email_type: EMAIL_TYPE })

  if (claimError) {
    // Unique violation means it was already sent. Anything else is worth seeing.
    if (claimError.code !== '23505') {
      console.error('[welcome] could not claim send', claimError)
    }
    return
  }

  try {
    const resend = new Resend(apiKey)
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: 'Welcome to RateMama. Your verdicts matter.',
      html: welcomeHtml(firstName),
    })
  } catch (error) {
    console.error('[welcome] send failed', error)
    // Release the claim so a later attempt can retry.
    await admin
      .from('sent_emails')
      .delete()
      .eq('user_id', userId)
      .eq('email_type', EMAIL_TYPE)
  }
}
