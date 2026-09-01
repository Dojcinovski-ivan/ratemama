'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

export const CONSENT_COOKIE = 'analytics_consent'
export const CONSENT_EVENT = 'ratemama:consent'

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export function readConsent(): 'true' | 'false' | null {
  if (typeof document === 'undefined') return null
  const m = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`))
  const v = m ? decodeURIComponent(m[1]) : null
  return v === 'true' || v === 'false' ? v : null
}

export function writeConsent(value: 'true' | 'false') {
  const oneYear = 365 * 24 * 60 * 60
  document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=${oneYear}; SameSite=Lax`
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }))
  // Declining after having accepted has to actually stop the tracking,
  // not just stop future page views, so clear what Google already set.
  if (value === 'false') clearGoogleCookies()
}

function clearGoogleCookies() {
  const host = window.location.hostname
  const domains = [host, `.${host}`, `.${host.split('.').slice(-2).join('.')}`]
  document.cookie.split('; ').forEach((entry) => {
    const name = entry.split('=')[0]
    if (!/^(_ga|_gid|_gat)/.test(name)) return
    domains.forEach((d) => {
      document.cookie = `${name}=; path=/; domain=${d}; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    })
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
  })
}

/** Sends a page view on client side navigation, which gtag cannot see. */
function PageViews() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const w = window as unknown as { gtag?: (...args: unknown[]) => void }
    if (!GA_ID || typeof w.gtag !== 'function') return
    const query = searchParams.toString()
    w.gtag('event', 'page_view', {
      page_path: query ? `${pathname}?${query}` : pathname,
      page_location: window.location.href,
    })
  }, [pathname, searchParams])

  return null
}

/**
 * Google Analytics, loaded only after someone has actively accepted.
 *
 * Under PECR analytics cookies need consent before they are set, so
 * nothing here runs until the cookie says true. Declining, or simply
 * never answering, loads no Google script at all.
 */
export function Analytics() {
  const [consented, setConsented] = useState(false)

  useEffect(() => {
    setConsented(readConsent() === 'true')
    function onChange(e: Event) {
      setConsented((e as CustomEvent).detail === 'true')
    }
    window.addEventListener(CONSENT_EVENT, onChange)
    return () => window.removeEventListener(CONSENT_EVENT, onChange)
  }, [])

  if (!GA_ID || !consented) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'granted'
          });
          gtag('config', '${GA_ID}', { anonymize_ip: true });
        `}
      </Script>
      <Suspense fallback={null}>
        <PageViews />
      </Suspense>
    </>
  )
}
