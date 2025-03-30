/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  modularizeImports: {
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': './src',
      '@/components': './src/components',
      '@/lib': './src/lib',
      '@/styles': './src/styles',
      '@/types': './src/types',
      '@/utils': './src/utils',
      '@/hooks': './src/hooks',
      '@/contexts': './src/contexts',
    };
  
    return config;
  },
};

export default nextConfig;
