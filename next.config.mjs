/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Open Food Facts product photography
      { protocol: 'https', hostname: 'images.openfoodfacts.org' },
      { protocol: 'https', hostname: 'world.openfoodfacts.org' },
      // Supabase Storage, for profile photos
      { protocol: 'https', hostname: 'nyrslcqljjnxzpmszqjx.supabase.co' },
    ],
  },
}

export default nextConfig
