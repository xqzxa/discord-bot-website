/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['discord.js'],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
