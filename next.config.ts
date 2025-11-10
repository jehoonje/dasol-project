import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
  // 타입 안전 라우팅
  typedRoutes: true,
  // 성능 최적화
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  // 프로덕션 최적화
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
