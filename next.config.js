/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { domains: [] },
  experimental: { serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'] }
};
export default nextConfig;
