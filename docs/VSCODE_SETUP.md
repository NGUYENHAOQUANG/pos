# Hướng dẫn cài đặt VSCode cho dự án

## Yêu cầu

-   Visual Studio Code (VSCode) phiên bản mới nhất
-   Node.js >= 20

## Bước 1: Cài đặt Extensions

### Cách 1: Tự động cài đặt (Khuyến nghị)

1. Mở VSCode trong thư mục dự án
2. VSCode sẽ tự động hiển thị thông báo đề xuất cài đặt extensions ở góc dưới bên phải
3. Click **"Install All"** hoặc **"Install Recommended"**

**Nếu không thấy thông báo**, làm theo các cách bên dưới.

### Cách 2: Cài đặt qua Extensions View (Dễ nhất)

1. **Mở Extensions View:**

    - Nhấn `Cmd+Shift+X` (Mac) hoặc `Ctrl+Shift+X` (Windows/Linux)
    - Hoặc click icon Extensions ở sidebar bên trái (biểu tượng 4 hình vuông)

2. **Tìm và cài từng extension:**
    - Gõ tên extension vào ô tìm kiếm
    - Click **"Install"** cho mỗi extension

#### Danh sách extensions cần cài:

**Bắt buộc:**

1. **Prettier - Code formatter**

    - Tìm: `Prettier` hoặc `esbenp.prettier-vscode`
    - Tác giả: Prettier
    - Click **Install**

2. **ESLint**

    - Tìm: `ESLint` hoặc `dbaeumer.vscode-eslint`
    - Tác giả: Microsoft
    - Click **Install**

3. **TypeScript and JavaScript Language Features**
    - Thường đã được cài sẵn với VSCode
    - Nếu chưa có, tìm: `TypeScript` hoặc `ms-vscode.vscode-typescript-next`

**Khuyến nghị:**

4. **Path Intellisense**

    - Tìm: `Path Intellisense` hoặc `christian-kohler.path-intellisense`
    - Click **Install**

5. **Auto Rename Tag**
    - Tìm: `Auto Rename Tag` hoặc `formulahendry.auto-rename-tag`
    - Click **Install**

### Cách 3: Cài đặt qua Command Palette

1. Mở Command Palette:

    - `Cmd+Shift+P` (Mac) hoặc `Ctrl+Shift+P` (Windows/Linux)

2. Gõ và chọn: `Extensions: Show Recommended Extensions`

3. Danh sách extensions sẽ hiện ra, click **Install** cho từng extension

### Cách 4: Cài đặt qua Terminal/Command Line

Mở terminal trong VSCode (` Ctrl+`` hoặc  `View → Terminal`) và chạy các lệnh sau:

```bash
# Cài Prettier
code --install-extension esbenp.prettier-vscode

# Cài ESLint
code --install-extension dbaeumer.vscode-eslint

# Cài TypeScript (nếu chưa có)
code --install-extension ms-vscode.vscode-typescript-next

# Cài Path Intellisense
code --install-extension christian-kohler.path-intellisense

# Cài Auto Rename Tag
code --install-extension formulahendry.auto-rename-tag
```

**Lưu ý:** Lệnh `code` chỉ hoạt động nếu bạn đã cài VSCode command line tools. Nếu không, mở VSCode → Command Palette → `Shell Command: Install 'code' command in PATH`

### Cách 5: Cài đặt tất cả cùng lúc (Terminal)

Chạy lệnh sau để cài tất cả extensions cùng lúc:

```bash
code --install-extension esbenp.prettier-vscode \
     --install-extension dbaeumer.vscode-eslint \
     --install-extension ms-vscode.vscode-typescript-next \
     --install-extension christian-kohler.path-intellisense \
     --install-extension formulahendry.auto-rename-tag
```

### Kiểm tra đã cài đặt chưa

1. Mở Extensions View (`Cmd+Shift+X` / `Ctrl+Shift+X`)
2. Gõ `@installed` vào ô tìm kiếm
3. Kiểm tra xem các extensions trên đã có trong danh sách chưa
4. Nếu extension đã cài, sẽ hiển thị **"Installed"** thay vì **"Install"**

## Bước 2: Kiểm tra cấu hình

Sau khi cài đặt extensions, kiểm tra các cấu hình sau:

### 1. Format On Save

VSCode sẽ tự động format code khi lưu file nhờ cấu hình trong `.vscode/settings.json`.

Để kiểm tra:

1. Mở một file `.tsx` hoặc `.ts`
2. Thêm một số khoảng trắng thừa
3. Lưu file (`Cmd+S` / `Ctrl+S`)
4. Code sẽ tự động được format

### 2. ESLint Auto Fix

ESLint sẽ tự động sửa lỗi khi lưu file.

Để kiểm tra:

1. Tạo một biến không sử dụng: `const unused = 1;`
2. Lưu file
3. Biến sẽ tự động bị xóa hoặc có cảnh báo

### 3. Tab Size

Đảm bảo tab size là **4 spaces** (không phải 2):

1. Mở bất kỳ file nào
2. Nhấn `Tab` để tạo indent
3. Kiểm tra xem có đúng 4 spaces không

Hoặc kiểm tra ở góc dưới bên phải VSCode, sẽ hiển thị "Spaces: 4"

## Bước 3: Cấu hình Format Code Rules

Dự án sử dụng các rule format code sau:

### Prettier Rules (`.prettierrc.js`)

-   **Indent size**: 4 spaces
-   **Print width**: 100 characters
-   **Single quotes**: `true`
-   **Semicolons**: `true`
-   **Trailing commas**: `es5`
-   **Arrow parens**: `avoid` (ví dụ: `x => x` thay vì `(x) => x`)
-   **End of line**: `lf` (Linux/Mac style)

### ESLint Rules (`.eslintrc.js`)

-   Extends: `@react-native`
-   Tự động fix khi save

## Bước 4: Sử dụng Format Code

### Format một file

1. Mở file cần format
2. Nhấn `Shift+Option+F` (Mac) hoặc `Shift+Alt+F` (Windows/Linux)
3. Hoặc click chuột phải → **Format Document**

### Format toàn bộ dự án

Chạy lệnh trong terminal:

```bash
npm run format
```

### Format và fix lỗi ESLint

```bash
npm run lint:fix
```

## Troubleshooting

### Không thấy thông báo đề xuất cài extensions

1. **Kiểm tra file `.vscode/extensions.json` có tồn tại không:**

    - File này chứa danh sách extensions recommend
    - Nếu không có, VSCode sẽ không hiện thông báo

2. **Thử cách thủ công:**

    - Mở Extensions View (`Cmd+Shift+X` / `Ctrl+Shift+X`)
    - Gõ `@recommended` vào ô tìm kiếm
    - Danh sách extensions recommend sẽ hiện ra

3. **Kiểm tra VSCode settings:**
    - Mở Settings (`Cmd+,` / `Ctrl+,`)
    - Tìm: `extensions.ignoreRecommendations`
    - Đảm bảo giá trị là `false`

### VSCode không tự động format khi save

1. Kiểm tra extension Prettier đã được cài đặt chưa
2. Kiểm tra file `.vscode/settings.json` có tồn tại không
3. Restart VSCode
4. Kiểm tra trong Settings: `Editor: Format On Save` phải là `true`

### ESLint không hoạt động

1. Kiểm tra extension ESLint đã được cài đặt chưa
2. Mở Command Palette và chạy: `ESLint: Show Output Channel`
3. Kiểm tra xem có lỗi gì không
4. Restart VSCode

### Tab size không đúng (vẫn là 2 thay vì 4)

1. Kiểm tra `.vscode/settings.json` có `"editor.tabSize": 4` không
2. Kiểm tra `.prettierrc.js` có `tabWidth: 4` không
3. Kiểm tra `.editorconfig` có `indent_size = 4` không
4. Restart VSCode
5. Nếu vẫn không được, mở Command Palette và chạy: `Change Language Mode` → chọn lại loại file

### Prettier không format đúng

1. Kiểm tra extension Prettier đã được cài đặt và enable chưa
2. Kiểm tra `.prettierrc.js` có tồn tại và đúng cấu hình không
3. Mở Command Palette và chạy: `Prettier: Check Configuration`
4. Restart VSCode

## Các phím tắt hữu ích

-   **Format Document**: `Shift+Option+F` (Mac) / `Shift+Alt+F` (Windows/Linux)
-   **Format Selection**: `Cmd+K Cmd+F` (Mac) / `Ctrl+K Ctrl+F` (Windows/Linux)
-   **Command Palette**: `Cmd+Shift+P` (Mac) / `Ctrl+Shift+P` (Windows/Linux)
-   **Quick Open**: `Cmd+P` (Mac) / `Ctrl+P` (Windows/Linux)
-   **Go to Symbol**: `Cmd+Shift+O` (Mac) / `Ctrl+Shift+O` (Windows/Linux)

## Lưu ý

-   Luôn commit file `.vscode/settings.json` và `.editorconfig` vào git để đảm bảo tất cả team member có cùng cấu hình
-   Nếu có vấn đề, hãy xóa thư mục `.vscode` và tạo lại từ file trong repo
-   Đảm bảo tất cả team member đều cài đặt các extensions được recommend

## Liên hệ

Nếu gặp vấn đề, vui lòng liên hệ team lead hoặc tạo issue trong repository.
