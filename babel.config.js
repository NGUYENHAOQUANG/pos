module.exports = {
    presets: ['module:@react-native/babel-preset'],
    plugins: [
        [
            'module-resolver',
            {
                root: ['./src'],
                extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
                alias: {
                    '@': './src',
                    '@/app': './src/app',
                    '@/features': './src/features',
                    '@/shared': './src/shared',
                    '@/core': './src/core',
                    '@/assets': './src/assets',
                    '@/styles': './src/styles',
                },
            },
        ],
        [
            'module:react-native-dotenv',
            {
                moduleName: '@env',
                path: '.env',
                safe: false,
                allowUndefined: true,
                verbose: false,
                cache: false,
            },
        ],
        'react-native-reanimated/plugin',
    ],
};
