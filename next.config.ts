import type { NextConfig } from "next";
import { resolve } from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: resolve(import.meta.dirname ?? ".", "."),
  },
  images: {
    // Allow high-quality output so detailed product/science art isn't
    // softened by the default quality-75 compression.
    qualities: [75, 90, 100],
  },
};

export default nextConfig;
