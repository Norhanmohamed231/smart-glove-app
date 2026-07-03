const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.resolver.sourceExts.push('mjs');
config.resolver.assetExts.push('onnx');

module.exports = config;