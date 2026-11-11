import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // turbopack: {
  //   root: '.',
  // },
  serverExternalPackages: ['firebase-admin', 'jwks-rsa', 'jose'],

  experimental: {
    scrollRestoration: true,
  },
  allowedDevOrigins: ['localhost', '127.0.0.1', 'blandness-drown-shrank.ngrok-free.dev'],
  async redirects() {
    return [
      {
        source: '/admin/navigation',
        destination: '/admin',
        permanent: false,
      },
      {
        source: '/admin/dashboard',
        destination: '/admin',
        permanent: false,
      },
      {
        source: '/dashboard',
        destination: '/admin',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
