'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { lookupBarcode } from './actions'
import { Button, FormError } from '@/components/ui'

/**
 * Camera barcode scanner.
 *
 * The browser BarcodeDetector API is not available in iOS Safari, where a
 * large share of parents will open this, so the reader is loaded from a
 * library instead. It is imported only when the scanner opens, so nobody
 * who never taps the button pays for the bundle.
 */
export function Scanner() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [manual, setManual] = useState('')
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const controlsRef = useRef<{ stop: () => void } | null>(null)

  useEffect(() => {
    if (!open) return
    let cancelled = false

    async function start() {
      setError('')
      setStatus('Starting the camera')
      try {
        const { BrowserMultiFormatReader } = await import('@zxing/browser')
        if (cancelled) return
        const reader = new BrowserMultiFormatReader()
        const controls = await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current ?? undefined,
          (result) => {
            if (result && !cancelled) {
              cancelled = true
              controls.stop()
              handleCode(result.getText())
            }
          }
        )
        controlsRef.current = controls
        if (!cancelled) setStatus('Point the camera at the barcode')
      } catch {
        if (cancelled) return
        setError(
          'We could not open the camera. You can type the barcode in below instead.'
        )
        setStatus('')
      }
    }

    start()
    return () => {
      cancelled = true
      controlsRef.current?.stop()
      controlsRef.current = null
    }
    // handleCode only navigates, so it does not need to retrigger the camera.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  async function handleCode(code: string) {
    setStatus('Looking that up')
    const result = await lookupBarcode(code)
    if (result.slug) {
      router.push(`/products/${result.slug}`)
      return
    }
    if (result.notFound) {
      router.push(`/products/add?barcode=${encodeURIComponent(code.replace(/\D/g, ''))}`)
      return
    }
    setError(result.error ?? 'Something went wrong. Please try again.')
    setStatus('')
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} variant="secondary" className="sm:hidden">
        <svg viewBox="0 0 24 24" aria-hidden className="mr-2 h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 7V5a1 1 0 011-1h2M20 7V5a1 1 0 00-1-1h-2M4 17v2a1 1 0 001 1h2M20 17v2a1 1 0 01-1 1h-2" strokeLinecap="round" />
          <path d="M7 8v8M10 8v8M13 8v8M17 8v8" strokeLinecap="round" />
        </svg>
        Scan a product
      </Button>
    )
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="overflow-hidden rounded-xl bg-neutral-900">
        <video ref={videoRef} className="h-56 w-full object-cover" muted playsInline />
      </div>

      {status && <p className="mt-3 text-sm text-neutral-600">{status}</p>}
      {error && (
        <div className="mt-3">
          <FormError>{error}</FormError>
        </div>
      )}

      <div className="mt-4">
        <label htmlFor="manual-barcode" className="block text-sm font-medium text-neutral-800">
          Or type the barcode
        </label>
        <div className="mt-1.5 flex gap-2">
          <input
            id="manual-barcode"
            inputMode="numeric"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder="5000157062673"
            className="block w-full rounded-xl border border-neutral-300 px-4 py-3 text-base focus:outline focus:outline-2 focus:outline-worth"
          />
          <button
            type="button"
            onClick={() => manual && handleCode(manual)}
            className="shrink-0 rounded-xl bg-worth px-4 py-3 text-sm font-semibold text-worth-fg"
          >
            Look up
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen(false)}
        className="mt-4 w-full text-sm font-medium text-neutral-500"
      >
        Close scanner
      </button>
    </div>
  )
}
