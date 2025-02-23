import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    GOOGLE_DRIVE_FOLDER_ID: process.env.GOOGLE_DRIVE_FOLDER_ID,
    GOOGLE_SERVICE_ACCOUNT_KEY: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
  },
  output: "standalone",  // This enables better deployment optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",  // Adjust this based on your image domains
      },
    ],
  },
};

export default nextConfig;