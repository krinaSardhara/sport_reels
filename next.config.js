/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  async redirects() {
    return [
      // Basic redirect
      {
        source: '/',
        destination: '/reels',
        permanent: true,
      },
    ]
  },
};

module.exports = nextConfig;
