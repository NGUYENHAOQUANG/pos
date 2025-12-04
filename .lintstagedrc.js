module.exports = {
  '*.{js,jsx,ts,tsx}': filenames => {
    // Loại bỏ .lintstagedrc.js khỏi danh sách files để check
    const filesToLint = filenames.filter(file => !file.includes('.lintstagedrc.js'));
    if (filesToLint.length === 0) {
      return []; // Không có file nào cần check
    }
    return [
      `eslint --fix ${filesToLint.join(' ')}`, // Tự động fix nếu có thể
      `eslint --max-warnings=0 ${filesToLint.join(' ')}`, // Fail nếu còn warnings sau khi fix
      `prettier --write ${filenames.join(' ')}`, // Format tất cả files
    ];
  },
  '*.{json,md,yml,yaml}': ['prettier --write'],
};
