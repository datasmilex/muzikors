import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // iyzipay npm paketi artık kullanılmıyor.
  // Tüm iyzico iletişimi built-in crypto + fetch() ile pure REST API üzerinden yapılıyor.
  // Bu sayede Vercel serverless bundle'da herhangi bir 3rd-party bağımlılık hatası oluşmaz.
};

export default nextConfig;
