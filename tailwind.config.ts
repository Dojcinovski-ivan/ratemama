import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--font-serif)', 'ui-serif', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Worth it is always green, not worth it is always red.
        worth: {
          DEFAULT: '#4CAF7D',
          fg: '#FFFFFF',
          soft: '#E8F5EE',
          deep: '#2f7a55',
        },
        notworth: {
          DEFAULT: '#E05C5C',
          fg: '#FFFFFF',
          soft: '#FCEBEB',
          deep: '#a03a3a',
        },
        accent: {
          DEFAULT: '#F5A623',
          soft: '#FDF1DC',
          deep: '#8a5d10',
        },
        // Warm neutrals lifted from the design.
        cream: {
          50: '#FDFCFA',
          100: '#FAF9F6',
          200: '#F5F2EC',
          300: '#EDE9E1',
        },
        ink: {
          DEFAULT: '#26232F',
          soft: '#5A5666',
        },
      },
      maxWidth: {
        app: '28rem',
        page: '72rem',
      },
      borderRadius: {
        card: '1rem',
      },
    },
  },
  plugins: [],
}

export default config
