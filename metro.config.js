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
    sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json', 'svg', 'cjs', 'mjs'],
    blockList: [
      // Exclude build artifacts and temp files (but NOT node_modules/*/build)
      /.*\.cxx\/.*/,
      /.*CMakeFiles\/.*/,
      /.*\.gradle\/.*/,
      // Only block /android/build and /ios/build, not node_modules
      /android\/build\/.*/,
      /ios\/build\/.*/,
    ],
  },
  watchFolders: [path.resolve(__dirname, 'node_modules')],
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
