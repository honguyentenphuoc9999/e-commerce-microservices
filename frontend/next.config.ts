import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ['192.168.5.1', '*.trycloudflare.com', '*.loca.lt'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8900/api/:path*',
      },
    ];
  },
};

export default nextConfig;
