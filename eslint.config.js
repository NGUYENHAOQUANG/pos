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
            parser: require('@typescript-eslint/parser'),
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
                project: null, // Disable type-aware linting for performance
            },
        },
        plugins: {
            '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
            'react-hooks': require('eslint-plugin-react-hooks'),
        },
        rules: {
            // Basic rules - sẽ được extend từ @react-native/eslint-config khi có
            'no-unused-vars': 'off', // Turn off base rule
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
            'no-console': 'off', // Allow console in mobile development
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
        },
    },
];
