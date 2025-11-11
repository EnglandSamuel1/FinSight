import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production optimizations
  // Source maps are disabled by default in production for security and performance
  // Enable if needed for debugging production issues (not recommended for MVP)
  productionBrowserSourceMaps: false,

  // Image optimization settings
  images: {
    // Configure image domains if using external images
    // For MVP, using local images and Supabase storage
    remotePatterns: [],
  },

  // Compression is handled automatically by Vercel
  // No additional configuration needed

  // TypeScript errors will fail the build in production
  typescript: {
    // Fail build on TypeScript errors
    ignoreBuildErrors: false,
  },
  // ESLint configuration is handled via eslint.config.mjs
  // Next.js will run ESLint during build automatically
};

export default nextConfig;
