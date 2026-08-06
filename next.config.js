const { BLOG_CANONICAL_OVERRIDES } = require('./src/lib/blog-canonical-map.js');

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'img.clerk.com' },
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
    ],
  },

  experimental: {
    serverComponentsExternalPackages: ['@neondatabase/serverless'],
  },

  async redirects() {
    return [
      // ── www → non-www ─────────────────────────────────────────────────────
      // bijeen.app en www.bijeen.app serveerden allebei de volledige site, met
      // twee sitemaps in Search Console. Google zag daardoor van elke pagina
      // twee versies en verdeelde de ranking-signalen over allebei. Deze regel
      // staat bewust in next.config (niet in de middleware): de middleware-
      // matcher slaat .xml/.txt over, waardoor www/sitemap.xml en www/robots.txt
      // anders bereikbaar zouden blijven.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.bijeen.app' }],
        destination: 'https://bijeen.app/:path*',
        permanent: true,
      },

      // ── Blog-consolidatie ─────────────────────────────────────────────────
      // Gegenereerd uit dezelfde map die seo.ts gebruikt voor rel=canonical en
      // de sitemap-filter, zodat de drie mechanismen niet uit elkaar lopen.
      ...Object.entries(BLOG_CANONICAL_OVERRIDES).map(([from, to]) => ({
        source: `/blog/${from}`,
        destination: `/blog/${to}`,
        permanent: true,
      })),
    ];
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
