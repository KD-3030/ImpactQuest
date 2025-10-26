/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Vercel serverless function timeout
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  webpack: (config) => {
    // Externalize and ignore problematic dependencies
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    
    // Resolve fallbacks for Node.js modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };

    // Create aliases to ignore React Native dependencies
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false,
      'react-native-sqlite-storage': false,
    };

    return config;
  },
};

export default nextConfig;
