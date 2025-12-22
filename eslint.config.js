// ESLint 9 flat config
// Fallback config khi ESLint 9 được sử dụng
// ESLint 8 sẽ vẫn dùng .eslintrc.js

module.exports = [
    {
        ignores: [
            '**/node_modules/**',
            'build/**',
            'dist/**',
            '*.log',
            'android/**',
            'ios/**',
            '**/Pods/**',
            'babel.config.js',
            'metro.config.js',
            'jest.config.js',
            '.lintstagedrc.js',
            '.prettierrc.js',
            'coverage/**',
            '.expo/**',
            'package-lock.json',
            'yarn.lock',
            'Podfile.lock',
            '.env*',
            '.vscode/**',
            '.idea/**',
            '.DS_Store',
            'Thumbs.db',
        ],
    },
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        rules: {
            // Basic rules - sẽ được extend từ @react-native/eslint-config khi có
            'no-unused-vars': 'warn',
            'no-console': 'warn',
        },
    },
];
