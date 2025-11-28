# Hướng Dẫn Cài Đặt Môi Trường Phát Triển

Tài liệu này hướng dẫn chi tiết cách cài đặt môi trường phát triển cho dự án React Native trên cả Windows và macOS.

## Mục Lục

- [Prerequisites](#prerequisites)
- [Cài Đặt Trên Windows](#cài-đặt-trên-windows)
- [Cài Đặt Trên macOS](#cài-đặt-trên-macos)
- [Cài Đặt Dự Án](#cài-đặt-dự-án)
- [Kiểm Tra Cài Đặt](#kiểm-tra-cài-đặt)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Trước khi bắt đầu, bạn cần cài đặt các công cụ cơ bản sau:

### 1. Node.js (Phiên bản 20 trở lên)

**Kiểm tra phiên bản hiện tại:**
```bash
node --version
```

**Cài đặt Node.js:**

- **Tải về:** [https://nodejs.org/](https://nodejs.org/)
- **Khuyến nghị:** Cài đặt phiên bản LTS (Long Term Support) mới nhất
- **Yêu cầu tối thiểu:** Node.js 20.x trở lên

**Sau khi cài đặt, kiểm tra:**
```bash
node --version  # Phải >= 20.0.0
npm --version   # npm đi kèm với Node.js
```

### 2. Git

**Kiểm tra Git:**
```bash
git --version
```

**Cài đặt Git:**

- **Windows:** [https://git-scm.com/download/win](https://git-scm.com/download/win)
- **macOS:** Đã có sẵn hoặc cài qua Xcode Command Line Tools

### 3. Package Manager (Tùy chọn)

Dự án sử dụng npm (đi kèm với Node.js), nhưng bạn có thể dùng yarn nếu muốn:

```bash
npm install -g yarn
```

---

## Cài Đặt Trên Windows

### Bước 1: Cài Đặt JDK 17

React Native yêu cầu Java Development Kit (JDK) 17 để build ứng dụng Android.

#### 1.1. Tải và Cài Đặt JDK 17

**Tùy chọn 1: Oracle JDK**
- Tải về: [https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html)
- Chọn: Windows x64 Installer

**Tùy chọn 2: OpenJDK (Khuyến nghị)**
- Tải về: [https://adoptium.net/](https://adoptium.net/)
- Chọn: Temurin 17 (LTS) - Windows x64

#### 1.2. Cấu Hình JAVA_HOME

1. Mở **System Properties** (Nhấn `Win + Pause` hoặc tìm "Environment Variables")
2. Click **Environment Variables**
3. Trong **System variables**, click **New**
4. Thêm biến mới:
   - **Variable name:** `JAVA_HOME`
   - **Variable value:** `C:\Program Files\Eclipse Adoptium\jdk-17.0.x-hotspot` (đường dẫn cài đặt JDK của bạn)

5. Tìm biến **Path** trong **System variables**, click **Edit**
6. Click **New** và thêm: `%JAVA_HOME%\bin`

#### 1.3. Kiểm Tra Cài Đặt

Mở Command Prompt mới và chạy:
```bash
java -version
```

Kết quả mong đợi:
```
openjdk version "17.0.x" ...
```

### Bước 2: Cài Đặt Android Studio

#### 2.1. Tải và Cài Đặt

1. Tải Android Studio: [https://developer.android.com/studio](https://developer.android.com/studio)
2. Chạy file cài đặt và làm theo hướng dẫn
3. Trong quá trình cài đặt, đảm bảo chọn:
   - ✅ Android SDK
   - ✅ Android SDK Platform
   - ✅ Android Virtual Device

#### 2.2. Cấu Hình Android SDK

1. Mở Android Studio
2. Click **More Actions** → **SDK Manager** (hoặc **File** → **Settings** → **Appearance & Behavior** → **System Settings** → **Android SDK**)

3. Trong tab **SDK Platforms**, chọn:
   - ✅ **Android 14.0 (UpsideDownCake)** - API Level 34
   - ✅ Show Package Details (góc dưới bên phải)
   - Đảm bảo các items sau được chọn:
     - ✅ Android SDK Platform 34
     - ✅ Intel x86 Atom_64 System Image hoặc Google APIs Intel x86 Atom System Image

4. Trong tab **SDK Tools**, chọn:
   - ✅ Android SDK Build-Tools 34
   - ✅ Android Emulator
   - ✅ Android SDK Platform-Tools
   - ✅ Intel x86 Emulator Accelerator (HAXM installer)

5. Click **Apply** để tải và cài đặt

#### 2.3. Cấu Hình Environment Variables

1. Mở **Environment Variables** (như bước 1.2)
2. Thêm biến **ANDROID_HOME**:
   - **Variable name:** `ANDROID_HOME`
   - **Variable value:** `C:\Users\<YourUsername>\AppData\Local\Android\Sdk`

3. Cập nhật biến **Path**, thêm các dòng sau:
   ```
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\emulator
   %ANDROID_HOME%\tools
   %ANDROID_HOME%\tools\bin
   ```

#### 2.4. Kiểm Tra Cài Đặt

Mở Command Prompt mới và chạy:
```bash
adb --version
```

### Bước 3: Tạo Android Virtual Device (AVD)

1. Mở Android Studio
2. Click **More Actions** → **Virtual Device Manager**
3. Click **Create Device**
4. Chọn một device (khuyến nghị: Pixel 5)
5. Chọn system image: **UpsideDownCake** (API Level 34)
6. Click **Next** → **Finish**

---

## Cài Đặt Trên macOS

### Bước 1: Cài Đặt Homebrew (Nếu chưa có)

Homebrew là package manager cho macOS, giúp cài đặt các công cụ dễ dàng hơn.

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Bước 2: Cài Đặt JDK 17

#### 2.1. Cài Đặt qua Homebrew

```bash
brew install openjdk@17
```

#### 2.2. Cấu Hình JAVA_HOME

Thêm vào file `~/.zshrc` (hoặc `~/.bash_profile` nếu dùng bash):

```bash
# Mở file cấu hình
nano ~/.zshrc

# Thêm dòng sau:
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export PATH=$JAVA_HOME/bin:$PATH

# Lưu file (Ctrl + O, Enter, Ctrl + X)

# Reload cấu hình
source ~/.zshrc
```

#### 2.3. Kiểm Tra Cài Đặt

```bash
java -version
```

Kết quả mong đợi:
```
openjdk version "17.0.x" ...
```

### Bước 3: Cài Đặt Xcode (Cho iOS Development)

#### 3.1. Cài Đặt Xcode

1. Mở **App Store**
2. Tìm kiếm **Xcode**
3. Click **Get** để tải và cài đặt (dung lượng ~12GB, mất thời gian)

#### 3.2. Cài Đặt Command Line Tools

```bash
xcode-select --install
```

#### 3.3. Cấu Hình Xcode

1. Mở Xcode
2. Đồng ý với License Agreement
3. Xcode sẽ cài đặt các components bổ sung
4. Vào **Xcode** → **Preferences** → **Locations**
5. Đảm bảo **Command Line Tools** đã được chọn

### Bước 4: Cài Đặt CocoaPods

CocoaPods là dependency manager cho iOS projects.

#### 4.1. Cài Đặt qua Homebrew (Khuyến nghị)

```bash
brew install cocoapods
```

#### 4.2. Hoặc cài đặt qua gem

```bash
sudo gem install cocoapods
```

#### 4.3. Kiểm Tra Cài Đặt

```bash
pod --version
```

### Bước 5: Cài Đặt Android Studio (Tùy chọn - cho Android Development)

Nếu bạn muốn phát triển cho Android trên macOS, làm theo các bước tương tự như Windows:

#### 5.1. Tải và Cài Đặt

1. Tải Android Studio: [https://developer.android.com/studio](https://developer.android.com/studio)
2. Kéo Android Studio vào thư mục Applications
3. Mở Android Studio và làm theo setup wizard

#### 5.2. Cấu Hình Android SDK

Làm theo các bước tương tự như Windows (Bước 2.2)

#### 5.3. Cấu Hình Environment Variables

Thêm vào `~/.zshrc` (hoặc `~/.bash_profile`):

```bash
# Mở file cấu hình
nano ~/.zshrc

# Thêm các dòng sau:
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin

# Lưu và reload
source ~/.zshrc
```

#### 5.4. Kiểm Tra Cài Đặt

```bash
adb --version
```

---

## Cài Đặt Dự Án

Sau khi hoàn tất cài đặt môi trường, bạn có thể clone và setup dự án.

### Bước 1: Clone Repository

```bash
# Clone dự án
git clone <repository-url>

# Di chuyển vào thư mục dự án
cd mebioneapp
```

### Bước 2: Cài Đặt Dependencies

```bash
# Cài đặt npm packages
npm install

# Hoặc nếu dùng yarn
yarn install
```

### Bước 3: Cài Đặt iOS Pods (Chỉ macOS)

```bash
# Di chuyển vào thư mục ios
cd ios

# Cài đặt CocoaPods dependencies
pod install

# Quay lại thư mục root
cd ..
```

**Lưu ý:** Nếu gặp lỗi, thử:
```bash
cd ios
pod deintegrate
pod install
cd ..
```

### Bước 4: Cấu Hình Environment Variables

1. Copy file `.env.example` thành `.env`:

```bash
# Windows (Command Prompt)
copy .env.example .env

# macOS/Linux
cp .env.example .env
```

2. Mở file `.env` và cập nhật các giá trị cần thiết:

```env
# API Configuration
API_BASE_URL=https://api.example.com
API_TIMEOUT=30000

# App Configuration
APP_NAME=MebiOneApp
APP_VERSION=0.0.1

# Environment
NODE_ENV=development
```

### Bước 5: Chạy Ứng Dụng

#### Chạy trên iOS (Chỉ macOS)

```bash
# Khởi động Metro bundler
npm start

# Trong terminal khác, chạy iOS
npm run ios

# Hoặc chạy trên device cụ thể
npm run ios -- --simulator="iPhone 15 Pro"
```

#### Chạy trên Android

```bash
# Đảm bảo emulator đang chạy hoặc device đã kết nối

# Khởi động Metro bundler
npm start

# Trong terminal khác, chạy Android
npm run android
```

#### Chạy trên Physical Device

**iOS:**
1. Kết nối iPhone qua USB
2. Mở `ios/BaseStructure.xcworkspace` trong Xcode
3. Chọn device của bạn
4. Click Run (⌘ + R)

**Android:**
1. Bật Developer Options và USB Debugging trên device
2. Kết nối device qua USB
3. Kiểm tra device đã kết nối: `adb devices`
4. Chạy: `npm run android`

---

## Kiểm Tra Cài Đặt

Sử dụng checklist sau để đảm bảo môi trường đã được cài đặt đúng:

### ✅ Checklist Chung

- [ ] Node.js version >= 20.0.0
  ```bash
  node --version
  ```

- [ ] npm hoặc yarn đã cài đặt
  ```bash
  npm --version
  # hoặc
  yarn --version
  ```

- [ ] Git đã cài đặt
  ```bash
  git --version
  ```

- [ ] JDK 17 đã cài đặt
  ```bash
  java -version
  ```

### ✅ Checklist Windows

- [ ] JAVA_HOME environment variable đã set
  ```bash
  echo %JAVA_HOME%
  ```

- [ ] Android Studio đã cài đặt
- [ ] Android SDK Platform 34 đã cài đặt
- [ ] ANDROID_HOME environment variable đã set
  ```bash
  echo %ANDROID_HOME%
  ```

- [ ] adb command hoạt động
  ```bash
  adb --version
  ```

- [ ] Android Emulator đã tạo và có thể chạy

### ✅ Checklist macOS

- [ ] JAVA_HOME đã set trong ~/.zshrc
  ```bash
  echo $JAVA_HOME
  ```

- [ ] Xcode đã cài đặt (cho iOS)
  ```bash
  xcodebuild -version
  ```

- [ ] Command Line Tools đã cài đặt
  ```bash
  xcode-select -p
  ```

- [ ] CocoaPods đã cài đặt
  ```bash
  pod --version
  ```

- [ ] ANDROID_HOME đã set (nếu phát triển Android)
  ```bash
  echo $ANDROID_HOME
  ```

### ✅ Checklist Dự Án

- [ ] Dependencies đã cài đặt
  ```bash
  ls node_modules
  ```

- [ ] iOS Pods đã cài đặt (macOS)
  ```bash
  ls ios/Pods
  ```

- [ ] File .env đã tạo và cấu hình
  ```bash
  cat .env
  ```

- [ ] Metro bundler có thể khởi động
  ```bash
  npm start
  ```

- [ ] Ứng dụng build thành công trên iOS (macOS)
  ```bash
  npm run ios
  ```

- [ ] Ứng dụng build thành công trên Android
  ```bash
  npm run android
  ```

---

## Troubleshooting

### Vấn Đề Thường Gặp

#### 1. Node.js Version Không Đúng

**Triệu chứng:**
```
error: The engine "node" is incompatible with this module
```

**Giải pháp:**
- Cài đặt Node.js 20 trở lên từ [nodejs.org](https://nodejs.org/)
- Hoặc sử dụng nvm (Node Version Manager):
  ```bash
  # macOS/Linux
  nvm install 20
  nvm use 20

  # Windows (nvm-windows)
  nvm install 20
  nvm use 20
  ```

#### 2. JAVA_HOME Không Được Set

**Triệu chứng:**
```
ERROR: JAVA_HOME is not set
```

**Giải pháp Windows:**
1. Kiểm tra JDK đã cài đặt: `java -version`
2. Tìm đường dẫn cài đặt JDK (thường là `C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot`)
3. Set JAVA_HOME theo hướng dẫn ở Bước 1.2
4. Restart Command Prompt

**Giải pháp macOS:**
1. Kiểm tra JDK: `java -version`
2. Thêm vào `~/.zshrc`:
   ```bash
   export JAVA_HOME=$(/usr/libexec/java_home -v 17)
   ```
3. Reload: `source ~/.zshrc`

#### 3. Android SDK Not Found

**Triệu chứng:**
```
SDK location not found
```

**Giải pháp:**
1. Kiểm tra ANDROID_HOME:
   ```bash
   # Windows
   echo %ANDROID_HOME%

   # macOS
   echo $ANDROID_HOME
   ```

2. Nếu chưa set, làm theo hướng dẫn cấu hình environment variables
3. Đảm bảo đường dẫn đúng:
   - Windows: `C:\Users\<YourUsername>\AppData\Local\Android\Sdk`
   - macOS: `$HOME/Library/Android/sdk`

#### 4. Pod Install Failed (macOS)

**Triệu chứng:**
```
[!] CocoaPods could not find compatible versions for pod
```

**Giải pháp:**
```bash
cd ios

# Xóa cache
rm -rf Pods
rm Podfile.lock

# Cập nhật CocoaPods repo
pod repo update

# Cài đặt lại
pod install

cd ..
```

#### 5. Metro Bundler Port Already in Use

**Triệu chứng:**
```
Error: listen EADDRINUSE: address already in use :::8081
```

**Giải pháp:**

**Windows:**
```bash
# Tìm process đang dùng port 8081
netstat -ano | findstr :8081

# Kill process (thay <PID> bằng process ID)
taskkill /PID <PID> /F
```

**macOS:**
```bash
# Tìm và kill process
lsof -ti:8081 | xargs kill -9
```

#### 6. Build Failed - Gradle Error (Android)

**Triệu chứng:**
```
Could not resolve all dependencies for configuration
```

**Giải pháp:**
```bash
cd android

# Clean build
./gradlew clean

# Hoặc trên Windows
gradlew.bat clean

cd ..

# Thử build lại
npm run android
```

#### 7. Xcode Build Failed (iOS)

**Triệu chứng:**
```
error: Build input file cannot be found
```

**Giải pháp:**
```bash
# Clean build folder
cd ios
xcodebuild clean
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# Reinstall pods
pod deintegrate
pod install

cd ..

# Thử build lại
npm run ios
```

#### 8. Unable to Boot Simulator

**Triệu chứng:**
```
Unable to boot device in current state: Booted
```

**Giải pháp:**
```bash
# Shutdown tất cả simulators
xcrun simctl shutdown all

# Erase simulator
xcrun simctl erase all

# Thử lại
npm run ios
```

#### 9. Android Emulator Không Khởi Động

**Triệu chứng:**
Emulator không mở hoặc bị crash

**Giải pháp:**
1. Kiểm tra virtualization đã bật trong BIOS
2. Windows: Cài đặt Intel HAXM
   - Mở SDK Manager → SDK Tools → Intel x86 Emulator Accelerator
3. Thử tạo emulator mới với cấu hình thấp hơn
4. Kiểm tra RAM và disk space đủ

#### 10. npm install Failed

**Triệu chứng:**
```
npm ERR! code EACCES
```

**Giải pháp:**

**Windows:**
```bash
# Chạy Command Prompt as Administrator
# Hoặc xóa node_modules và thử lại
rmdir /s /q node_modules
del package-lock.json
npm install
```

**macOS:**
```bash
# Không dùng sudo với npm
# Xóa và cài lại
rm -rf node_modules
rm package-lock.json
npm install
```

### Lấy Thêm Trợ Giúp

Nếu vẫn gặp vấn đề:

1. **Kiểm tra logs chi tiết:**
   ```bash
   # Android
   npm run android -- --verbose

   # iOS
   npm run ios -- --verbose
   ```

2. **React Native Doctor:**
   ```bash
   npx react-native doctor
   ```

3. **Tài liệu chính thức:**
   - [React Native Environment Setup](https://reactnative.dev/docs/environment-setup)
   - [Android Studio Setup](https://developer.android.com/studio/install)
   - [Xcode Setup](https://developer.apple.com/xcode/)

4. **Liên hệ team:** Hỏi các developers khác trong team hoặc tạo issue trong repository

---

## Kết Luận

Sau khi hoàn tất tất cả các bước trên, bạn đã sẵn sàng để phát triển ứng dụng React Native!

**Các bước tiếp theo:**
1. Đọc [ARCHITECTURE.md](./ARCHITECTURE.md) để hiểu kiến trúc dự án
2. Đọc [API_GUIDE.md](./API_GUIDE.md) để học cách làm việc với APIs
3. Đọc [COMPONENTS.md](./COMPONENTS.md) để tìm hiểu về shared components
4. Bắt đầu code! 🚀

**Tips:**
- Luôn chạy `npm start` trước khi chạy `npm run ios` hoặc `npm run android`
- Sử dụng hot reload để tăng tốc độ phát triển
- Kiểm tra console logs để debug
- Commit code thường xuyên

Chúc bạn code vui vẻ! 💻✨
