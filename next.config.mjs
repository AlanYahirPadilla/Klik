/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  // Configuración para permitir builds sin variables de entorno
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
}

export default nextConfig
