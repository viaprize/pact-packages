/** @type {import("next").NextConfig} */
import BundleAnalyzer from '@next/bundle-analyzer';
import './env.mjs';

const withBundleAnalyzer = BundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer({
  reactStrictMode: true,
  transpilePackages: ['@viaprize/ui'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dweb.link',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.io',
        
      },
      {
        protocol:'https',
        hostname:'gitcoin.mypinata.cloud',
    
      },
      {
        protocol: 'https',
        hostname: 'img.freepik.com',
        port: '',
        pathname: '/**',
      },
      {
        hostname: 'placehold.co',
      },
      {
        hostname: 'placehold.jp',
      },
      {
        hostname: 'uofqdqrrquswprylyzby.supabase.co',
      },
    ],
  },
  output: 'standalone',
});
