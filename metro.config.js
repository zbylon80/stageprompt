const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ignore WSL folders
config.watchFolders = [];
config.resolver = {
  ...config.resolver,
  blockList: [
    /~\/.*/,
    /.*\/~\/.*/,
  ],
};

module.exports = config;
