const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// @summit/shared is symlinked from ../shared and has no node_modules of its own,
// so let Metro resolve its dependencies (zod) from the mobile app.
config.resolver.nodeModulesPaths = [path.resolve(__dirname, 'node_modules')];

module.exports = config;
