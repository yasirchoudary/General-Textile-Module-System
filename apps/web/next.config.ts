import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@gtms/types",
    "@gtms/auth-contracts",
    "@gtms/config",
    "@gtms/ui",
  ],
};

export default nextConfig;
