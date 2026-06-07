const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Allow Metro to resolve files from the frontend/ shared directory
config.watchFolders = [
  path.resolve(__dirname, '../frontend/src'),
];

config.resolver.alias = {
  '@shared/services': path.resolve(__dirname, '../frontend/src/services'),
  '@shared/state': path.resolve(__dirname, '../frontend/src/state'),
  '@shared/types': path.resolve(__dirname, '../frontend/src/types'),
};

module.exports = withNativeWind(config, { input: './src/styles/global.css' });
