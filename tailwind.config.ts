import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Verdict colours. These two are fixed brand constants:
        // worth it is always green, not worth it is always red.
        worth: {
          DEFAULT: '#4CAF7D',
          fg: '#FFFFFF',
          soft: '#E8F5EE',
        },
        notworth: {
          DEFAULT: '#E05C5C',
          fg: '#FFFFFF',
          soft: '#FCEBEB',
        },
      },
      // Mobile first: content column caps at a comfortable phone width and
      // only widens at explicit breakpoints.
      maxWidth: {
        app: '28rem',
      },
    },
  },
  plugins: [],
}

export default config
