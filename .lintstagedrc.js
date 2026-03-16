module.exports = {
    '*.{js,jsx,ts,tsx}': filenames => {
        const filesToLint = filenames.filter(
            file =>
                !file.includes('.lintstagedrc.js') &&
                !file.includes('.prettierrc.js') &&
                !file.includes('eslint.config.js') &&
                !file.includes('babel.config.js') &&
                !file.includes('react-native.config.js')
        );
        if (filesToLint.length === 0) {
            return [];
        }
        return [
            `npx eslint --fix ${filesToLint.join(' ')}`,
            `npx eslint --max-warnings=0 ${filesToLint.join(' ')}`,
            `npx prettier --write ${filenames.join(' ')}`,
        ];
    },
    '*.{json,md,yml,yaml}': ['npx prettier --write'],
};
