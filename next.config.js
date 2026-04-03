/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permitir imágenes externas si se necesitan
  images: {
    remotePatterns: [],
  },
  // Asegurar que las rutas de API funcionen correctamente
  experimental: {},
};

module.exports = nextConfig;
