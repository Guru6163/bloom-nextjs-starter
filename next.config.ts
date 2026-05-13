import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.trybloom.ai",
        pathname: "/img/**",
      },
    ],
  },
}

export default nextConfig
