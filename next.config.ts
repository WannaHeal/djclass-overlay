import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization is supported via Cloudflare Images
  // but we keep unoptimized for simpler deployment
  images: {
    unoptimized: true,
  },
  
  // Enable trailing slashes for better URL consistency
  trailingSlash: true,
  
  // Disable powered by header
  poweredByHeader: false,
  
  // Custom headers for OBS compatibility
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
