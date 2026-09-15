const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.projectRoot = __dirname;
config.watchFolders = [__dirname];

module.exports = config;
