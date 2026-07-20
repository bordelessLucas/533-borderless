import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@socio247/domain', '@socio247/firebase'],
  // Pacotes internos usam imports ESM com sufixo .js apontando para .ts
  webpack: (config) => {
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js'],
    };
    return config;
  },
};

export default nextConfig;
