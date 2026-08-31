import { DM_Serif_Display, Inter } from 'next/font/google'

/** Headings. The serif is most of the character in this design. */
export const serif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
})

/** Body copy. */
export const sans = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})
