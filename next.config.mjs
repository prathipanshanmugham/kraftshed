/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }, { protocol: 'http', hostname: '**' }] },
  experimental: { serverActions: { bodySizeLimit: '10mb' } },
};
export default nextConfig;
