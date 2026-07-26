import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    '/api/**/*': ['./node_modules/iyzipay/**/*', './node_modules/postman-request/**/*'],
  },
  serverExternalPackages: ['iyzipay', 'postman-request'],
};

export default nextConfig;
