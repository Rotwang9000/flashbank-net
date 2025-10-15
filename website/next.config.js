/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // GitHub Pages deployment configuration
  basePath: process.env.NODE_ENV === 'production' ? '/flashbank-net' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/flashbank-net/' : '',
  typescript: {
    // Skip type checking during build for now
    ignoreBuildErrors: true,
  },
  eslint: {
    // Skip ESLint during build for now
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: '/app',
        destination: '/',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
