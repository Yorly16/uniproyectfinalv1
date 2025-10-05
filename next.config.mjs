/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // eliminar esta línea si está presente
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
