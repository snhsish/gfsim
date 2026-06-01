import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: [
    "better-auth",
    "@better-auth/core",
    "@better-auth/drizzle-adapter",
    "@better-auth/kysely-adapter",
    "kysely",
    "postgres",
  ],
  turbopack: {
    resolveAlias: {
      // Drizzle-only app: stub kysely adapter (fixes kysely@0.29 + Turbopack)
      "@better-auth/kysely-adapter": "./stubs/empty-kysely-adapter.mjs",
    },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve ??= {};
      config.resolve.alias ??= {};
      config.resolve.alias["@better-auth/kysely-adapter"] =
        require("node:path").join(
          process.cwd(),
          "stubs/empty-kysely-adapter.mjs",
        );
    }
    return config;
  },
};

export default nextConfig;
