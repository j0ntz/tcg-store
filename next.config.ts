import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // Vercel seeds a branch's Turbopack build cache from main's production build. With the cache on,
    // the custom *.css loader rule below reused main's compiled globals.css for this branch, so previews
    // shipped the scaffold stylesheet instead of the design tokens. Compile CSS from source every build.
    turbopackFileSystemCacheForBuild: false,
  },
  images: {
    // Card art is served from the Pokémon TCG API's image hosts and never copied into the repo.
    remotePatterns: [
      { protocol: "https", hostname: "images.pokemontcg.io", pathname: "/**" },
      { protocol: "https", hostname: "images.scrydex.com", pathname: "/**" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
