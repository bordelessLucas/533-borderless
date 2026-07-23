import type { NextConfig } from 'next';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.join(appDir, '../..');

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  transpilePackages: ['@socio247/domain', '@socio247/firebase'],
  // Evita o Next escolher /home/eduardo/package-lock.json como root
  outputFileTracingRoot: monorepoRoot,
  // Pacotes internos usam imports ESM com sufixo .js apontando para .ts
  webpack: (config) => {
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js'],
    };
    return config;
  },
};

export default nextConfig;
