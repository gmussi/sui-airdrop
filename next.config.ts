import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Enable static export for GitHub Pages
  distDir: "dist",
  // Add base path if deploying to a subdirectory
  basePath: '/sui-airdrop',
  assetPrefix: '/sui-airdrop/',
};

export default nextConfig;
