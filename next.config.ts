import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "b.zmtcdn.com",
      },
    ],
  },
};

export default nextConfig;
