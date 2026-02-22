/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    return [
      {
        source: '/api/n8n/:path*',
        destination: `${process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
