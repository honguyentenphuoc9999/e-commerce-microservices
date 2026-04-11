import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: ['192.168.5.1'],
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8900/api/:path*', // Proxy to Backend Gateway
      },
    ];
  },
};

export default nextConfig;
