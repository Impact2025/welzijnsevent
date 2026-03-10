/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'img.clerk.com' },
    ],
  },

  experimental: {
    serverComponentsExternalPackages: ['@neondatabase/serverless'],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Verhinder clickjacking
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Verhinder MIME-type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Referrer beperken
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Permissies beperken
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
          // DNS prefetch toestaan voor performance
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          // HSTS: dwing HTTPS af (alleen in productie actief via browser cache)
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
      // Cache statische assets agressief
      {
        source: '/(.*)\\.(ico|png|jpg|jpeg|webp|svg|woff2?|ttf)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
