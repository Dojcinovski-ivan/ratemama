const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ratemama.com'

/** From address. One constant so switching sender is a single edit. */
export const FROM = 'RateMama <hello@ratemama.com>'

export function siteUrl() {
  return SITE
}

export function button(href: string, label: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
    <tr><td style="border-radius:14px;background:#4CAF7D;">
      <a href="${href}" style="display:inline-block;padding:14px 28px;font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;">${label}</a>
    </td></tr>
  </table>`
}

export function foundingBadge() {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
    <tr><td style="border-radius:999px;background:#E8F5EE;padding:8px 14px;font-size:13px;font-weight:700;color:#2f7a55;">
      Founding member
    </td></tr>
  </table>`
}

/**
 * Shared shell. The unsubscribe link carries a signed token so it works
 * straight from the inbox without logging in.
 */
export function shell({
  heading,
  bodyHtml,
  unsubscribeUrl,
}: {
  heading: string
  bodyHtml: string
  unsubscribeUrl?: string
}) {
  return `<!doctype html>
<html lang="en">
<body style="margin:0;background:#f6f6f4;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f4;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:20px;padding:32px;">
        <tr><td>
          <p style="margin:0 0 24px;font-size:18px;font-weight:700;color:#4CAF7D;">RateMama</p>
          <h1 style="margin:0 0 16px;font-size:26px;line-height:1.3;color:#171717;">${heading}</h1>
          ${bodyHtml}
          <hr style="border:none;border-top:1px solid #e5e5e5;margin:0 0 20px;" />
          <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#8a8a8a;">
            RateMama is a community platform not a sponsored review site.
          </p>
          <p style="margin:0;font-size:13px;line-height:1.6;color:#8a8a8a;">
            ${unsubscribeUrl ? `<a href="${unsubscribeUrl}" style="color:#8a8a8a;">Unsubscribe</a> &nbsp;&middot;&nbsp; ` : ''}
            <a href="${SITE}/privacy" style="color:#8a8a8a;">Privacy Policy</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}
