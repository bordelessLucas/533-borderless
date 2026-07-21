const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

/** Uma única cópia nativa — evita RNCSafeAreaProvider / screens duplicados. */
const SINGLETONS = [
  'react',
  'react-dom',
  'react-native',
  'react-native-gesture-handler',
  'react-native-safe-area-context',
  'react-native-screens',
];

function resolveSingleton(moduleName) {
  const match = SINGLETONS.find(
    (name) => moduleName === name || moduleName.startsWith(`${name}/`),
  );
  if (!match) return null;

  if (moduleName === match) {
    return require.resolve(match, { paths: [projectRoot] });
  }

  const subpath = moduleName.slice(match.length + 1);
  const pkgRoot = path.dirname(require.resolve(`${match}/package.json`, { paths: [projectRoot] }));
  return require.resolve(path.join(pkgRoot, subpath), { paths: [pkgRoot] });
}

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const singletonPath = resolveSingleton(moduleName);
  if (singletonPath) {
    return { type: 'sourceFile', filePath: singletonPath };
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
