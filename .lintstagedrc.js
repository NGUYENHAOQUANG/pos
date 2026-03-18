module.exports = {
    '*.{js,jsx,ts,tsx}': filenames => {
        const filesToLint = filenames.filter(
            file =>
                !file.includes('babel.config.js') &&
                !file.includes('metro.config.js') &&
                !file.includes('jest.config.js') &&
                !file.includes('.lintstagedrc.js') &&
                !file.includes('.prettierrc.js') &&
                !file.includes('eslint.config.js')
        );
        if (filesToLint.length === 0) {
            return [];
        }
        return [
            `npx eslint --fix --no-warn-ignored ${filesToLint.join(' ')}`,
            `npx eslint --max-warnings=0 --no-warn-ignored ${filesToLint.join(' ')}`,
            `npx prettier --write ${filenames.join(' ')}`,
        ];
    },
    '*.{json,md,yml,yaml}': ['npx prettier --write'],
};
