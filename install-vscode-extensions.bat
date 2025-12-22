@echo off
REM Script cài đặt VSCode extensions cho dự án (Windows)
REM Chạy script này: install-vscode-extensions.bat

echo 🚀 Đang cài đặt VSCode extensions cho dự án...
echo.

REM Kiểm tra xem lệnh 'code' có tồn tại không
where code >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Lệnh 'code' không tìm thấy!
    echo.
    echo 📝 Để cài đặt lệnh 'code':
    echo    1. Mở VSCode
    echo    2. Nhấn Ctrl+Shift+P
    echo    3. Gõ: Shell Command: Install 'code' command in PATH
    echo    4. Chọn option đó
    echo.
    echo Hoặc cài đặt thủ công qua Extensions View (Ctrl+Shift+X)
    pause
    exit /b 1
)

REM Danh sách extensions
set extensions=esbenp.prettier-vscode dbaeumer.vscode-eslint ms-vscode.vscode-typescript-next christian-kohler.path-intellisense formulahendry.auto-rename-tag

REM Cài đặt từng extension
for %%e in (%extensions%) do (
    echo 📦 Đang cài đặt: %%e
    code --install-extension %%e --force
    if %errorlevel% equ 0 (
        echo ✅ Đã cài đặt: %%e
    ) else (
        echo ❌ Lỗi khi cài đặt: %%e
    )
    echo.
)

echo ✨ Hoàn tất! Vui lòng restart VSCode để áp dụng thay đổi.
echo.
echo 📚 Xem hướng dẫn chi tiết tại: docs\VSCODE_SETUP.md
pause

