/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["10.22.24.55"],
  serverExternalPackages: ["@prisma/client", ".prisma/client"],
};

module.exports = nextConfig;