import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    reactCompiler: false,
  },
};

initOpenNextCloudflareForDev();

export default nextConfig;
