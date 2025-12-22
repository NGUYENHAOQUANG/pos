#!/bin/bash

# Script cài đặt VSCode extensions cho dự án
# Chạy script này: bash install-vscode-extensions.sh

echo "🚀 Đang cài đặt VSCode extensions cho dự án..."
echo ""

# Kiểm tra xem lệnh 'code' có tồn tại không
if ! command -v code &> /dev/null; then
    echo "❌ Lệnh 'code' không tìm thấy!"
    echo ""
    echo "📝 Để cài đặt lệnh 'code':"
    echo "   1. Mở VSCode"
    echo "   2. Nhấn Cmd+Shift+P (Mac) hoặc Ctrl+Shift+P (Windows/Linux)"
    echo "   3. Gõ: Shell Command: Install 'code' command in PATH"
    echo "   4. Chọn option đó"
    echo ""
    echo "Hoặc cài đặt thủ công qua Extensions View (Cmd+Shift+X)"
    exit 1
fi

# Danh sách extensions
extensions=(
    "esbenp.prettier-vscode"
    "dbaeumer.vscode-eslint"
    "ms-vscode.vscode-typescript-next"
    "christian-kohler.path-intellisense"
    "formulahendry.auto-rename-tag"
)

# Cài đặt từng extension
for ext in "${extensions[@]}"; do
    echo "📦 Đang cài đặt: $ext"
    code --install-extension "$ext" --force
    if [ $? -eq 0 ]; then
        echo "✅ Đã cài đặt: $ext"
    else
        echo "❌ Lỗi khi cài đặt: $ext"
    fi
    echo ""
done

echo "✨ Hoàn tất! Vui lòng restart VSCode để áp dụng thay đổi."
echo ""
echo "📚 Xem hướng dẫn chi tiết tại: docs/VSCODE_SETUP.md"

