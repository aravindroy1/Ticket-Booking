/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Required for optimal Docker deployments
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

module.exports = nextConfig;
