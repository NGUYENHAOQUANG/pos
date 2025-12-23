# BaseStructure - React Native Enterprise-Level Architecture

Dự án React Native với kiến trúc Domain-Driven Design, tổ chức code theo features độc lập, sử dụng TypeScript và các công nghệ hiện đại để xây dựng ứng dụng mobile có khả năng mở rộng cao.

## ✨ Tính Năng Chính

-   🏗️ **Kiến trúc Domain-Driven**: Tổ chức code theo business domains, dễ bảo trì và mở rộng
-   🔐 **Authentication**: Hệ thống xác thực người dùng với JWT tokens
-   🎨 **Design System**: Hệ thống thiết kế nhất quán với colors, typography, spacing
-   📱 **Navigation**: Type-safe navigation với React Navigation v6
-   🔄 **State Management**: Zustand cho client state, TanStack Query cho server state
-   🌐 **API Integration**: Centralized API client với Axios và interceptors
-   📝 **Form Management**: React Hook Form với Zod validation
-   💾 **Storage**: React Native MMKV cho key-value storage hiệu suất cao
-   🎯 **TypeScript**: Type-safe code với TypeScript
-   🔗 **Path Aliases**: Import paths sạch với @ aliases

## 📋 Yêu Cầu Hệ Thống

Trước khi bắt đầu, đảm bảo bạn đã cài đặt:

-   **Node.js**: Phiên bản 20 trở lên
-   **npm** hoặc **yarn**: Package manager
-   **Git**: Version control
-   **JDK 17**: Java Development Kit cho Android development
-   **Android Studio**: Cho Android development (bao gồm Android SDK)
-   **Xcode**: Cho iOS development (chỉ trên macOS)
-   **CocoaPods**: Dependency manager cho iOS (chỉ trên macOS)

## 🚀 Cài Đặt

### Cài Đặt Nhanh

```bash
# Clone repository
git clone <repository-url>
cd BaseStructure

# Cài đặt dependencies
npm install

# iOS - Cài đặt pods (chỉ trên macOS)
cd ios && pod install && cd ..

# Tạo file .env từ template
cp .env.example .env
# Cập nhật các biến môi trường trong .env

# Khởi động Metro bundler
npm start

# Chạy trên iOS (macOS only)
npm run ios

# Chạy trên Android
npm run android
```

### Hướng Dẫn Chi Tiết

Để có hướng dẫn setup môi trường chi tiết cho Windows và macOS, bao gồm cài đặt JDK 17, Android Studio, Xcode, và troubleshooting, xem:

📖 **[ENVIRONMENT_SETUP.md](./docs/ENVIRONMENT_SETUP.md)** - Hướng dẫn setup môi trường đầy đủ

## 📁 Cấu Trúc Dự Án

```
src/
├── app/                          # App entry point và navigation
│   ├── navigation/               # Navigation configuration
│   ├── App.tsx                   # Root component
│   └── providers.tsx             # Global providers wrapper
│
├── features/                     # Feature modules (domain-driven)
│   ├── auth/                     # Authentication feature
│   ├── home/                     # Home feature
│   └── profile/                  # Profile feature
│   └── [feature]/
│       ├── api/                  # API calls cho feature
│       ├── components/           # UI components của feature
│       ├── hooks/                # Custom hooks của feature
│       ├── screens/              # Screen components
│       ├── store/                # Feature state (Zustand)
│       ├── types/                # TypeScript types
│       └── index.ts              # Public API exports
│
├── shared/                       # Shared resources
│   ├── components/               # Reusable UI components
│   ├── hooks/                    # Reusable custom hooks
│   ├── utils/                    # Utility functions
│   ├── constants/                # App constants
│   └── types/                    # Shared TypeScript types
│
├── core/                         # Core infrastructure
│   ├── api/                      # API client configuration
│   ├── store/                    # Global app state
│   ├── services/                 # Core services (storage, etc.)
│   └── config/                   # App configuration
│
├── assets/                       # Static assets
│   ├── images/                   # Image files
│   ├── fonts/                    # Font files
│   └── animations/               # Animation files
│
└── styles/                       # Global styles
    ├── colors.ts                 # Color tokens
    ├── typography.ts             # Typography system
    ├── spacing.ts                # Spacing scale
    ├── shadows.ts                # Shadow styles
    └── commonStyles.ts           # Common style utilities
```

## 🛠️ Technology Stack

### Core

-   **React**: 19.1.1 - UI library
-   **React Native**: 0.82.1 - Mobile framework
-   **TypeScript**: 5.8.3 - Type safety

### Navigation

-   **@react-navigation/native**: 6.1.9 - Navigation framework
-   **@react-navigation/native-stack**: 6.9.17 - Stack navigator
-   **@react-navigation/bottom-tabs**: 6.5.11 - Tab navigator

### State Management

-   **Zustand**: 4.4.7 - Client state management
-   **@tanstack/react-query**: 5.17.0 - Server state management

### API & Data

-   **Axios**: 1.6.2 - HTTP client
-   **React Native MMKV**: 2.11.0 - Fast storage

### Forms & Validation

-   **React Hook Form**: 7.49.2 - Form management
-   **Zod**: 3.22.4 - Schema validation
-   **@hookform/resolvers**: 3.3.2 - Form validation resolvers

### UI Components

-   **@ant-design/react-native**: 5.4.3 - UI component library
-   **react-native-vector-icons**: 10.3.0 - Icon library

### Animation

-   **react-native-reanimated**: 4.1.5 - Animation library
-   **react-native-gesture-handler**: 2.14.0 - Gesture handling

### Development Tools

-   **ESLint**: 8.19.0 - Code linting
-   **Prettier**: 2.8.8 - Code formatting
-   **Jest**: 29.6.3 - Testing framework
-   **Babel**: 7.25.2 - JavaScript compiler

## 📜 Available Scripts

```bash
# Khởi động Metro bundler
npm start

# Chạy ứng dụng trên iOS simulator (macOS only)
npm run ios

# Chạy ứng dụng trên Android emulator/device
npm run android

# Chạy linter để check code quality
npm run lint

# Chạy tests
npm test
```

## 💻 Cài Đặt VSCode Extensions

Để đảm bảo code được format đúng chuẩn (4 spaces), vui lòng cài đặt các VSCode extensions sau:

### Cách nhanh nhất (Khuyến nghị)

**Mac/Linux:**

```bash
bash install-vscode-extensions.sh
```

**Windows:**

```bash
install-vscode-extensions.bat
```

### Cách thủ công

1. Mở Extensions View: `Cmd+Shift+X` (Mac) hoặc `Ctrl+Shift+X` (Windows/Linux)
2. Tìm và cài các extensions sau:
    - **Prettier** (`esbenp.prettier-vscode`)
    - **ESLint** (`dbaeumer.vscode-eslint`)
    - **Path Intellisense** (`christian-kohler.path-intellisense`)
    - **Auto Rename Tag** (`formulahendry.auto-rename-tag`)

📖 **Xem hướng dẫn chi tiết:** [VSCODE_SETUP.md](./docs/VSCODE_SETUP.md)

## 📚 Documentation

Tài liệu chi tiết về các khía cạnh khác nhau của dự án:

-   **[VSCODE_SETUP.md](./docs/VSCODE_SETUP.md)** - Hướng dẫn cài đặt và cấu hình VSCode
-   **[ENVIRONMENT_SETUP.md](./docs/ENVIRONMENT_SETUP.md)** - Hướng dẫn setup môi trường cho Windows và macOS
-   **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - Kiến trúc Domain-Driven và tổ chức code
-   **[COMPONENTS.md](./docs/COMPONENTS.md)** - Documentation về shared components
-   **[STYLES_GUIDE.md](./docs/STYLES_GUIDE.md)** - Design system và style guidelines
-   **[CONVENTIONS.md](./docs/CONVENTIONS.md)** - Naming conventions và folder structure rules
-   **[STATE_MANAGEMENT.md](./docs/STATE_MANAGEMENT.md)** - State management với Zustand và TanStack Query
-   **[API_GUIDE.md](./docs/API_GUIDE.md)** - API integration patterns
-   **[RULES_COMMIT_MESSAGE_GIT.md](./docs/RULES_COMMIT_MESSAGE_GIT.md)** - Git commit message conventions

## 🏗️ Kiến Trúc

### Domain-Driven Features

Dự án sử dụng kiến trúc domain-driven, trong đó mỗi feature đại diện cho một business domain:

-   **Self-Contained**: Mỗi feature chứa tất cả code liên quan (api, components, hooks, screens, types)
-   **Clear Boundaries**: Features độc lập, có thể phát triển song song
-   **Public API**: Export qua `index.ts`, không import trực tiếp vào internal files
-   **Scalable**: Dễ dàng thêm features mới mà không ảnh hưởng code hiện tại

### State Management Strategy

-   **Zustand**: Client state (user preferences, UI state, app-level state)
-   **TanStack Query**: Server state (API data, caching, background refetching)
-   **React useState**: Local component state

### Path Aliases

Sử dụng TypeScript path aliases để import sạch hơn:

```typescript
// ✅ Good
import { Button } from '@/shared/components';
import { useAuth } from '@/features/auth';
import { colors } from '@/styles';

// ❌ Bad
import { Button } from '../../../shared/components/buttons/Button';
```

## 🔧 Troubleshooting

### Metro Bundler Issues

```bash
# Clear Metro cache
npm start -- --reset-cache

# Hoặc
npx react-native start --reset-cache
```

### iOS Build Issues

```bash
# Clean build folder
cd ios
rm -rf build
pod deintegrate
pod install
cd ..

# Rebuild
npm run ios
```

### Android Build Issues

```bash
# Clean Gradle cache
cd android
./gradlew clean
cd ..

# Rebuild
npm run android
```

### Node Modules Issues

```bash
# Xóa node_modules và reinstall
rm -rf node_modules
npm install

# iOS - Reinstall pods
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

### Environment Variables

Nếu gặp lỗi về environment variables:

1. Đảm bảo file `.env` tồn tại (copy từ `.env.example`)
2. Restart Metro bundler sau khi thay đổi `.env`
3. Rebuild app (không chỉ reload)

### Common Errors

**Error: JAVA_HOME not set**

-   Cài đặt JDK 17 và set JAVA_HOME environment variable
-   Xem [ENVIRONMENT_SETUP.md](./docs/ENVIRONMENT_SETUP.md) để biết chi tiết

**Error: SDK location not found**

-   Set ANDROID_HOME environment variable
-   Xem [ENVIRONMENT_SETUP.md](./docs/ENVIRONMENT_SETUP.md) để biết chi tiết

**Error: CocoaPods not installed**

-   Cài đặt CocoaPods: `sudo gem install cocoapods`
-   Hoặc dùng Homebrew: `brew install cocoapods`

**Error: Command PhaseScriptExecution failed**

-   Clean build folder trong Xcode
-   Xóa `ios/Pods` và chạy `pod install` lại

## 🤝 Contributing

Khi contribute vào dự án:

1. Đọc [CONVENTIONS.md](./docs/CONVENTIONS.md) để hiểu naming conventions
2. Đọc [ARCHITECTURE.md](./docs/ARCHITECTURE.md) để hiểu cấu trúc dự án
3. Follow [RULES_COMMIT_MESSAGE_GIT.md](./docs/RULES_COMMIT_MESSAGE_GIT.md) cho commit messages
4. Tạo feature branch từ `main`
5. Submit pull request với description rõ ràng

## 📝 Notes

-   **Domain-Driven Features**: Mỗi feature đại diện cho một business domain (auth, product, cart, order...)
-   **Screens vs Components**: Screens là container components (business logic, data fetching), Components là presentation components (UI only)
-   **Shared vs Feature Code**: Chỉ đưa code vào shared khi thực sự được reuse ở nhiều features
-   **Core Infrastructure**: Core chứa infrastructure code cho toàn bộ app (API client, storage, services)

## 📄 License

[Thêm license information nếu có]
