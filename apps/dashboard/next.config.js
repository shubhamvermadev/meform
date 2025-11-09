/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@meform/config", "@meform/db", "@meform/dto", "@meform/ui", "@meform/utils"],
};

module.exports = nextConfig;

