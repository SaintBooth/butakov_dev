import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import withSerwistInit from "@serwist/next";

const withNextIntl = createNextIntlPlugin("./i18n.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/media/**",
      },
    ],
  },
  typedRoutes: true,
};

const withSerwist = withSerwistInit({
  swSrc: "service-worker.ts",
  dev: process.env.NODE_ENV === "development",
  disable: process.env.NODE_ENV !== "production", // disable in dev/Turbopack
});

export default withSerwist(withNextIntl(nextConfig));
