
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: false,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/afyabook.herokuapp\.com\/api\/shops\/[^\/]+\/products/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
  ],
})


module.exports = withPWA({
  reactStrictMode: true,

  images: {
    domains: ['res.cloudinary.com'],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
});


