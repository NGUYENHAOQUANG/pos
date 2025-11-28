# Conventions - Quy Ước Đặt Tên và Tổ Chức Code

## Giới Thiệu

Document này định nghĩa các quy ước về đặt tên files, folders, và tổ chức code trong dự án React Native. Việc tuân thủ các quy ước này giúp:

- Duy trì tính nhất quán trong toàn bộ codebase
- Dễ dàng tìm kiếm và điều hướng code
- Giảm thiểu confusion khi làm việc nhóm
- Tăng khả năng maintain và scale dự án

## Naming Conventions

### 1. Components

**Format:** `PascalCase.tsx`

✅ **Good:**
```
Button.tsx
ProductCard.tsx
UserProfile.tsx
NavigationHeader.tsx
```

❌ **Bad:**
```
button.tsx          // lowercase
product-card.tsx    // kebab-case
user_profile.tsx    // snake_case
navigationheader.tsx // no separation
```

**Rules:**
- Tên component phải là danh từ hoặc cụm danh từ
- Sử dụng PascalCase (viết hoa chữ cái đầu mỗi từ)
- Tên file phải match với tên component export

### 2. Screens

**Format:** `PascalCase.tsx` với suffix `Screen`

✅ **Good:**
```
HomeScreen.tsx
LoginScreen.tsx
ProductDetailScreen.tsx
UserProfileScreen.tsx
```

❌ **Bad:**
```
Home.tsx            // missing Screen suffix
login-screen.tsx    // kebab-case
product_detail.tsx  // snake_case, missing suffix
```

**Rules:**
- Luôn thêm suffix `Screen` để phân biệt với components
- Screens là container components chứa business logic
- Mỗi screen thường map với một route trong navigation

### 3. Hooks

**Format:** `camelCase.ts` với prefix `use`

✅ **Good:**
```
useAuth.ts
useProducts.ts
useProductDetail.ts
useDebounce.ts
useLocalStorage.ts
```

❌ **Bad:**
```
UseAuth.ts          // PascalCase
auth-hook.ts        // missing use prefix
products.ts         // missing use prefix
use_debounce.ts     // snake_case
```

**Rules:**
- Luôn bắt đầu với prefix `use` (React convention)
- Sử dụng camelCase cho phần còn lại
- Tên hook nên mô tả chức năng hoặc data nó cung cấp

### 4. Utilities

**Format:** `camelCase.ts` hoặc descriptive name

✅ **Good:**
```
formatters.ts
validation.ts
dateUtils.ts
stringHelpers.ts
apiHelpers.ts
```

❌ **Bad:**
```
Formatters.ts       // PascalCase
format-utils.ts     // kebab-case
VALIDATION.ts       // UPPERCASE
utils.ts            // too generic
```

**Rules:**
- Sử dụng camelCase hoặc descriptive lowercase
- Tên file nên mô tả category của utilities
- Tránh tên quá generic như `utils.ts` hoặc `helpers.ts`

### 5. Types

**Format:** `camelCase.types.ts` hoặc `descriptiveName.types.ts`

✅ **Good:**
```
auth.types.ts
product.types.ts
navigation.types.ts
api.types.ts
common.types.ts
```

❌ **Bad:**
```
Auth.types.ts       // PascalCase
auth-types.ts       // kebab-case, missing .types
authTypes.ts        // missing .types extension
types.ts            // too generic
```

**Rules:**
- Luôn sử dụng suffix `.types.ts` để dễ identify
- Tên file nên mô tả domain hoặc feature
- Group related types trong cùng một file

### 6. API Files

**Format:** `camelCase.ts` với suffix `Api`

✅ **Good:**
```
authApi.ts
productApi.ts
userApi.ts
homeApi.ts
```

❌ **Bad:**
```
AuthApi.ts          // PascalCase
auth-api.ts         // kebab-case
auth.ts             // missing Api suffix
api.ts              // too generic
```

**Rules:**
- Luôn thêm suffix `Api` để identify API files
- Mỗi feature nên có API file riêng
- API file chứa tất cả API calls cho feature đó

### 7. Store Files

**Format:** `camelCase.ts` với suffix `Store`

✅ **Good:**
```
authStore.ts
userStore.ts
cartStore.ts
themeStore.ts
```

❌ **Bad:**
```
AuthStore.ts        // PascalCase
auth-store.ts       // kebab-case
auth.ts             // missing Store suffix
store.ts            // too generic
```

**Rules:**
- Luôn thêm suffix `Store` để identify Zustand stores
- Mỗi store nên focus vào một domain cụ thể
- Store file export custom hook (e.g., `useAuthStore`)

### 8. Constants

**Format:** `SCREAMING_SNAKE_CASE` cho constants, `camelCase.ts` cho file

✅ **Good:**
```typescript
// File: routes.ts
export const ROUTES = {
  HOME: '/home',
  LOGIN: '/login',
  PROFILE: '/profile',
} as const;

// File: apiEndpoints.ts
export const API_ENDPOINTS = {
  AUTH_LOGIN: '/auth/login',
  PRODUCTS_LIST: '/products',
} as const;
```

❌ **Bad:**
```typescript
// File: Routes.ts (PascalCase file)
export const routes = {  // lowercase constant
  home: '/home',
};

// File: api-endpoints.ts (kebab-case)
export const apiEndpoints = {  // camelCase constant
  authLogin: '/auth/login',
};
```

**Rules:**
- File names: `camelCase.ts`
- Constant names: `SCREAMING_SNAKE_CASE`
- Sử dụng `as const` để ensure type safety

### 9. Folders

**Format:** `kebab-case`

✅ **Good:**
```
features/
  auth/
  user-profile/
  product-catalog/
  shopping-cart/

shared/
  components/
  hooks/
  utils/
```

❌ **Bad:**
```
features/
  Auth/              // PascalCase
  user_profile/      // snake_case
  productCatalog/    // camelCase
  ShoppingCart/      // PascalCase
```

**Rules:**
- Tất cả folder names sử dụng kebab-case
- Feature folders nên là danh từ mô tả domain
- Tránh viết tắt không rõ nghĩa

**⚠️ Inconsistency Note:**

Hiện tại trong codebase có inconsistency giữa `component` (singular) và `components` (plural) trong một số features.

**Recommendation:** Standardize tất cả thành `components` (plural) để nhất quán:

```
✅ Recommended:
features/auth/components/
features/home/components/

❌ Avoid:
features/auth/component/
features/home/component/
```

## Folder Structure Rules

### Feature Module Structure

Mỗi feature module PHẢI tuân theo structure sau:

```
features/{feature-name}/
├── api/              # Required nếu feature có API calls
├── components/       # Required nếu feature có UI components
├── hooks/            # Required nếu feature có custom hooks
├── screens/          # Required - ít nhất một screen
├── store/            # Optional - chỉ khi cần local state
├── types/            # Required nếu có TypeScript types
└── index.ts          # Required - public API exports
```

### Required Folders

#### `screens/`
- **Bắt buộc** cho mọi feature
- Chứa screen components (container components)
- Mỗi feature phải có ít nhất một screen
- Screens handle navigation, data fetching, và business logic

#### `index.ts`
- **Bắt buộc** cho mọi feature
- Export public API của feature
- Giúp encapsulation và clean imports
- Xem section "Import Conventions" để biết cách sử dụng

### Optional Folders

#### `api/`
- Chỉ tạo khi feature cần gọi API
- Chứa API client functions
- Mỗi feature nên có một file API (e.g., `authApi.ts`)

#### `components/`
- Chỉ tạo khi feature có UI components riêng
- Chứa feature-specific components
- Không dùng cho shared components (dùng `shared/components/`)

#### `hooks/`
- Chỉ tạo khi feature có custom hooks
- Chứa business logic hooks
- Hooks có thể wrap API calls hoặc handle complex state

#### `store/`
- Chỉ tạo khi feature cần client state management
- Chứa Zustand stores
- Không dùng cho server state (dùng TanStack Query)

#### `types/`
- Chỉ tạo khi feature có TypeScript types/interfaces
- Chứa type definitions cho feature
- Export types qua `index.ts`

### Rules

✅ **Good Practices:**
- Chỉ tạo folders khi thực sự cần
- Xóa empty folders
- Giữ structure nhất quán giữa các features
- Document structure trong feature README nếu có điều đặc biệt

❌ **Bad Practices:**
- Tạo tất cả folders ngay từ đầu
- Giữ empty folders
- Tạo custom folders không theo convention
- Mix feature code với shared code

## Import Conventions

### Path Aliases

Dự án sử dụng TypeScript path aliases để import modules. Luôn sử dụng aliases thay vì relative paths.

**Available Aliases:**

```typescript
@/*           // src/
@/app/*       // src/app/
@/features/*  // src/features/
@/shared/*    // src/shared/
@/core/*      // src/core/
@/assets/*    // src/assets/
@/styles/*    // src/styles/
```

### Using Path Aliases

✅ **Good - Sử dụng path aliases:**

```typescript
import {Button} from '@/shared/components';
import {useAuth} from '@/features/auth';
import {colors, spacing} from '@/styles';
import {apiClient} from '@/core/api';
import Logo from '@/assets/images/logo.png';
```

❌ **Bad - Sử dụng relative paths:**

```typescript
import {Button} from '../../../shared/components/buttons/Button';
import {useAuth} from '../../features/auth/hooks/useAuth';
import {colors} from '../../../styles/colors';
import {apiClient} from '../../../../core/api/client';
```

**Benefits của Path Aliases:**
- Code dễ đọc và maintain hơn
- Không phụ thuộc vào folder depth
- Dễ dàng refactor và move files
- IDE autocomplete tốt hơn

### Public API Imports

Mỗi feature export public API qua `index.ts`. Luôn import từ feature index, không import trực tiếp từ internal files.

✅ **Good - Import từ feature index:**

```typescript
// Import từ feature public API
import {useAuth, LoginScreen, authApi} from '@/features/auth';
import {HomeScreen, useProducts} from '@/features/home';
import type {AuthUser, LoginCredentials} from '@/features/auth';

// Import từ shared public API
import {Button, Input, Container} from '@/shared/components';
import {useDebounce, useLocalStorage} from '@/shared/hooks';
```

❌ **Bad - Import từ internal files:**

```typescript
// Không import trực tiếp từ internal files
import {useAuth} from '@/features/auth/hooks/useAuth';
import {LoginScreen} from '@/features/auth/screens/LoginScreen';
import {authApi} from '@/features/auth/api/authApi';
import type {AuthUser} from '@/features/auth/types/auth.types';

// Không import từ component files
import {Button} from '@/shared/components/buttons/Button';
```

**Why Public API Pattern?**
- **Encapsulation:** Feature có thể thay đổi internal structure mà không ảnh hưởng consumers
- **Clear Interface:** Rõ ràng những gì được expose ra ngoài
- **Easier Refactoring:** Chỉ cần update index.ts khi move files
- **Better Documentation:** index.ts là documentation về public API

### Feature index.ts Example

```typescript
/**
 * @file index.ts
 * @description Auth feature - Public API
 */

// Screens
export {default as LoginScreen} from './screens/LoginScreen';
export {default as RegisterScreen} from './screens/RegisterScreen';

// Hooks
export {useAuth} from './hooks/useAuth';

// API
export {authApi} from './api/authApi';

// Types
export type {
  AuthUser,
  LoginCredentials,
  RegisterData,
  AuthResponse,
} from './types/auth.types';

// Store (if needed)
export {useAuthStore} from './store/authStore';
```

### Import Order

Organize imports theo thứ tự sau:

```typescript
// 1. External libraries
import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';

// 2. Internal aliases - Core
import {apiClient} from '@/core/api';
import {storage} from '@/core/services';

// 3. Internal aliases - Features
import {useAuth} from '@/features/auth';
import {useProducts} from '@/features/home';

// 4. Internal aliases - Shared
import {Button, Container} from '@/shared/components';
import {useDebounce} from '@/shared/hooks';

// 5. Internal aliases - Styles
import {colors, spacing, typography} from '@/styles';

// 6. Internal aliases - Assets
import Logo from '@/assets/images/logo.png';

// 7. Types
import type {Product} from '@/features/home';
import type {NavigationProps} from '@/types/navigation';

// 8. Relative imports (chỉ khi cần thiết)
import {ProductCard} from './components/ProductCard';
```

## Code Organization Patterns

### Component Structure Template

Organize component code theo template sau để maintain consistency:

```typescript
/**
 * @file ComponentName.tsx
 * @description Brief description of component
 * @author Your Name
 * @created YYYY-MM-DD
 */

// ============================================================================
// 1. IMPORTS
// ============================================================================
import React, {useState, useEffect, useCallback} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Button} from '@/shared/components';
import {colors, spacing} from '@/styles';
import type {ComponentProps} from './types';

// ============================================================================
// 2. TYPES & INTERFACES
// ============================================================================
interface Props {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
}

// ============================================================================
// 3. COMPONENT
// ============================================================================
export function ComponentName({title, onPress, disabled = false}: Props) {
  // ------------------------------------------------------------------------
  // 3.1 Hooks
  // ------------------------------------------------------------------------
  const navigation = useNavigation();

  // ------------------------------------------------------------------------
  // 3.2 State
  // ------------------------------------------------------------------------
  const [isLoading, setIsLoading] = useState(false);

  // ------------------------------------------------------------------------
  // 3.3 Effects
  // ------------------------------------------------------------------------
  useEffect(() => {
    // Effect logic
  }, []);

  // ------------------------------------------------------------------------
  // 3.4 Handlers
  // ------------------------------------------------------------------------
  const handlePress = useCallback(() => {
    if (onPress) {
      onPress();
    }
  }, [onPress]);

  // ------------------------------------------------------------------------
  // 3.5 Render
  // ------------------------------------------------------------------------
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Button onPress={handlePress} disabled={disabled || isLoading}>
        Press Me
      </Button>
    </View>
  );
}

// ============================================================================
// 4. STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.background.primary,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
});
```

### Screen Structure Template

Screens có structure tương tự nhưng thường phức tạp hơn:

```typescript
/**
 * @file HomeScreen.tsx
 * @description Home screen with product list
 * @author Your Name
 * @created YYYY-MM-DD
 */

// ============================================================================
// 1. IMPORTS
// ============================================================================
import React, {useCallback} from 'react';
import {View, FlatList, StyleSheet} from 'react-native';
import {Container, Button} from '@/shared/components';
import {useProducts} from '../hooks/useProducts';
import {ProductCard} from '../components/ProductCard';
import {colors, spacing} from '@/styles';
import type {Product} from '../types/product.types';

// ============================================================================
// 2. TYPES
// ============================================================================
interface Props {
  navigation: any; // Use proper navigation type
}

// ============================================================================
// 3. COMPONENT
// ============================================================================
export function HomeScreen({navigation}: Props) {
  // ------------------------------------------------------------------------
  // 3.1 Hooks & Data Fetching
  // ------------------------------------------------------------------------
  const {data: products, isLoading, refetch} = useProducts();

  // ------------------------------------------------------------------------
  // 3.2 Handlers
  // ------------------------------------------------------------------------
  const handleProductPress = useCallback((product: Product) => {
    navigation.navigate('ProductDetail', {id: product.id});
  }, [navigation]);

  const renderProduct = useCallback(({item}: {item: Product}) => (
    <ProductCard product={item} onPress={() => handleProductPress(item)} />
  ), [handleProductPress]);

  // ------------------------------------------------------------------------
  // 3.3 Render
  // ------------------------------------------------------------------------
  return (
    <Container>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshing={isLoading}
        onRefresh={refetch}
      />
    </Container>
  );
}

// ============================================================================
// 4. STYLES
// ============================================================================
const styles = StyleSheet.create({
  list: {
    padding: spacing.md,
  },
});
```

### Hook Structure Template

```typescript
/**
 * @file useProducts.ts
 * @description Hook for fetching and managing products
 * @author Your Name
 * @created YYYY-MM-DD
 */

// ============================================================================
// 1. IMPORTS
// ============================================================================
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {homeApi} from '../api/homeApi';
import type {Product} from '../types/product.types';

// ============================================================================
// 2. TYPES
// ============================================================================
interface UseProductsOptions {
  enabled?: boolean;
}

// ============================================================================
// 3. HOOK
// ============================================================================
export function useProducts(options?: UseProductsOptions) {
  return useQuery({
    queryKey: ['products'],
    queryFn: homeApi.getProducts,
    enabled: options?.enabled ?? true,
  });
}

export function useProductDetail(id: number) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => homeApi.getProductById(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: homeApi.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['products']});
    },
  });
}
```

### API File Structure Template

```typescript
/**
 * @file homeApi.ts
 * @description API calls for home feature
 * @author Your Name
 * @created YYYY-MM-DD
 */

// ============================================================================
// 1. IMPORTS
// ============================================================================
import {apiClient} from '@/core/api';
import type {Product, CreateProductDto} from '../types/product.types';

// ============================================================================
// 2. API FUNCTIONS
// ============================================================================
export const homeApi = {
  /**
   * Get all products
   */
  getProducts: async (): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>('/products');
    return response.data;
  },

  /**
   * Get product by ID
   */
  getProductById: async (id: number): Promise<Product> => {
    const response = await apiClient.get<Product>(`/products/${id}`);
    return response.data;
  },

  /**
   * Create new product
   */
  createProduct: async (data: CreateProductDto): Promise<Product> => {
    const response = await apiClient.post<Product>('/products', data);
    return response.data;
  },

  /**
   * Update product
   */
  updateProduct: async (id: number, data: Partial<Product>): Promise<Product> => {
    const response = await apiClient.put<Product>(`/products/${id}`, data);
    return response.data;
  },

  /**
   * Delete product
   */
  deleteProduct: async (id: number): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },
};
```

## TypeScript Conventions

### 1. Interfaces vs Types

✅ **Use Interfaces for:**
- Component props
- Object shapes
- Public APIs
- When you need declaration merging

```typescript
interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

interface User {
  id: number;
  name: string;
  email: string;
}
```

✅ **Use Types for:**
- Union types
- Intersection types
- Mapped types
- Complex type transformations

```typescript
type Status = 'idle' | 'loading' | 'success' | 'error';

type ApiResponse<T> = {
  data: T;
  status: number;
  message: string;
};

type Nullable<T> = T | null;
```

### 2. Type Exports

Export types từ feature `index.ts`:

```typescript
// features/auth/index.ts
export type {
  AuthUser,
  LoginCredentials,
  RegisterData,
  AuthResponse,
} from './types/auth.types';
```

Import types với `type` keyword:

```typescript
import type {AuthUser, LoginCredentials} from '@/features/auth';
```

### 3. Const Assertions

Sử dụng `as const` cho constant objects và arrays:

✅ **Good:**

```typescript
export const ROUTES = {
  HOME: '/home',
  LOGIN: '/login',
  PROFILE: '/profile',
} as const;

export const COLORS = ['red', 'blue', 'green'] as const;

// Type will be: readonly ['red', 'blue', 'green']
type Color = typeof COLORS[number]; // 'red' | 'blue' | 'green'
```

❌ **Bad:**

```typescript
export const ROUTES = {
  HOME: '/home',
  LOGIN: '/login',
  PROFILE: '/profile',
};
// Type will be: { HOME: string; LOGIN: string; PROFILE: string; }
```

### 4. Avoid Any

Tránh sử dụng `any`. Sử dụng `unknown` nếu không biết type:

✅ **Good:**

```typescript
function parseJSON(json: string): unknown {
  return JSON.parse(json);
}

// Type guard
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value
  );
}

const data = parseJSON(jsonString);
if (isUser(data)) {
  console.log(data.name); // TypeScript knows data is User
}
```

❌ **Bad:**

```typescript
function parseJSON(json: string): any {
  return JSON.parse(json);
}

const data = parseJSON(jsonString);
console.log(data.name); // No type safety
```

### 5. Generic Types

Sử dụng generic types cho reusable code:

```typescript
// Generic API response type
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// Generic list response
interface ListResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Usage
type ProductsResponse = ListResponse<Product>;
type UsersResponse = ListResponse<User>;
```

### 6. Utility Types

Sử dụng TypeScript utility types:

```typescript
// Partial - Make all properties optional
type PartialUser = Partial<User>;

// Pick - Select specific properties
type UserPreview = Pick<User, 'id' | 'name'>;

// Omit - Exclude specific properties
type UserWithoutPassword = Omit<User, 'password'>;

// Required - Make all properties required
type RequiredUser = Required<User>;

// Record - Create object type with specific keys
type UserRoles = Record<string, 'admin' | 'user' | 'guest'>;
```

### 7. Enum Alternatives

Thay vì enum, sử dụng const objects với `as const`:

✅ **Good:**

```typescript
export const UserRole = {
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];
// Type: 'admin' | 'user' | 'guest'
```

❌ **Avoid:**

```typescript
enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
}
// Generates extra JavaScript code
```

## File Header Comments

Mỗi file nên có header comment với metadata:

```typescript
/**
 * @file filename.tsx
 * @description Brief description of what this file does
 * @author Author Name
 * @created YYYY-MM-DD
 * @updated YYYY-MM-DD - Description of update (optional)
 */
```

**Example:**

```typescript
/**
 * @file Button.tsx
 * @description Reusable button component with multiple variants
 * @author Kindy
 * @created 2025-11-16
 * @updated 2025-11-17 - Added loading state support
 */
```

## Summary

### Quick Reference

| Item | Convention | Example |
|------|-----------|---------|
| Components | PascalCase.tsx | `Button.tsx` |
| Screens | PascalCase.tsx + Screen | `HomeScreen.tsx` |
| Hooks | camelCase.ts + use prefix | `useAuth.ts` |
| Utils | camelCase.ts | `formatters.ts` |
| Types | camelCase.types.ts | `auth.types.ts` |
| API | camelCase.ts + Api suffix | `authApi.ts` |
| Store | camelCase.ts + Store suffix | `authStore.ts` |
| Constants | SCREAMING_SNAKE_CASE | `API_ENDPOINTS` |
| Folders | kebab-case | `user-profile/` |

### Key Principles

1. **Consistency:** Tuân theo conventions trong toàn bộ codebase
2. **Clarity:** Tên file và folder phải rõ ràng, mô tả đúng nội dung
3. **Encapsulation:** Sử dụng public API pattern với index.ts
4. **Type Safety:** Leverage TypeScript để ensure code quality
5. **Maintainability:** Structure code để dễ maintain và scale

### Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Kiến trúc domain-driven
- [COMPONENTS.md](./COMPONENTS.md) - Shared components guide
- [STYLES_GUIDE.md](./STYLES_GUIDE.md) - Design system guide
- [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md) - State management patterns
- [API_GUIDE.md](./API_GUIDE.md) - API integration guide

---

**Note:** Nếu bạn phát hiện code không tuân theo conventions này, hãy refactor khi có cơ hội. Việc maintain consistency sẽ giúp codebase dễ làm việc hơn cho tất cả mọi người.
