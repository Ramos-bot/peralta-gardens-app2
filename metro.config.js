const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for WASM files
config.resolver.assetExts.push('wasm');

// Add resolver for WASM files in node_modules
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;
