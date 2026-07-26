import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    '/api/**/*': ['./node_modules/iyzipay/**/*'],
  },
  serverExternalPackages: ['iyzipay'],
};

export default nextConfig;
