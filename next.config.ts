import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bhooklagi.b-cdn.net",
      },
    ],
  },
};

export default nextConfig;
