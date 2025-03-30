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
    config.resolve.enforceExtension = false;
    config.resolve.enforceModuleExtension = false;
    // Enable case sensitive path checking
    config.resolve.symlinks = false;
    config.resolve.caseSensitive = true; 
    return config;
  },
};

export default nextConfig;
