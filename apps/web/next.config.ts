import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const rawTarget =
      process.env.INTERNAL_API_URL ||
      (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.startsWith('http')
        ? process.env.NEXT_PUBLIC_API_URL
        : 'https://funny-baron.outray.app/api/v1');

    const targetOrigin = rawTarget.replace(/\/api\/v1\/?$/, '');

    return [
      {
        source: '/api/v1/:path*',
        destination: `${targetOrigin}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;

