import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  output: "standalone",
  // gRPC native bindings + Prisma engine cannot be bundled by webpack/turbopack.
  // Loading them as external Node modules avoids the "undefined undefined: undefined"
  // gRPC error and Prisma client init failures inside route handlers.
  serverExternalPackages: [
    "@temporalio/client",
    "@temporalio/common",
    "@grpc/grpc-js",
    "@prisma/client",
  ],
};

export default nextConfig;
