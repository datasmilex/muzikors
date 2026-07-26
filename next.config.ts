import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // iyzipay ve tüm nested alt bağımlılıklarını (postman-request, extend vb.)
  // Vercel serverless bundle içerisine dahil et.
  // serverExternalPackages kullanmıyoruz: webpack bunları inline ederek çözsün.
  outputFileTracingIncludes: {
    '/api/**/*': [
      './node_modules/iyzipay/**/*',
    ],
  },
};

export default nextConfig;
