/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["pdf-parse", "@napi-rs/canvas"],
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
