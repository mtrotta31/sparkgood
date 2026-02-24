/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sparklocal.co",
      },
      {
        protocol: "https",
        hostname: "*.sparklocal.co",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  // Externalize native modules for server-side only
  experimental: {
    serverComponentsExternalPackages: ["@resvg/resvg-js", "pptxgenjs"],
  },
};

export default nextConfig;
