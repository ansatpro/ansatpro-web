/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable strict mode to avoid dependency issues
  eslint: {
    // Allow production builds with warnings
    ignoreDuringBuilds: true,
  },
  transpilePackages: [
    "@radix-ui/react-use-effect-event",
    "@radix-ui/react-use-layout-effect",
  ],
};

export default nextConfig;
