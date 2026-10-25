/**
 * Next.js is exported as a fully static site for GitHub Pages.
 *
 * NEXT_PUBLIC_BASE_PATH is set by the GitHub Actions workflow to the repo name
 * (e.g. /enwahs-demo). It stays empty for local development and for a
 * <owner>.github.io user site.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
};

export default nextConfig;
