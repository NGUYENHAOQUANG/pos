const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */

const config = {
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    assetExts: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'mp4', 'webm', 'mov'],
    sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json', 'svg'],
    blockList: [
      // Exclude build artifacts and temp files
      /.*\.cxx\/.*/,
      /.*CMakeFiles\/.*/,
      /.*\.gradle\/.*/,
      /.*\/build\/.*/,
    ],
  },
  watchFolders: [
    path.resolve(__dirname, 'node_modules'),
  ],
};


module.exports = mergeConfig(getDefaultConfig(__dirname), config);
