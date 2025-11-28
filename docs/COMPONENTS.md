# Component Documentation

Tài liệu này mô tả tất cả các shared components có sẵn trong dự án. Các components này được thiết kế để tái sử dụng xuyên suốt ứng dụng và đảm bảo tính nhất quán về UI/UX.

## Component Categories

Các components được tổ chức theo các categories sau:

- **Buttons**: Button, BackButton, Badge
- **Forms**: Input, SegmentedControl
- **Layout**: Container, SafeArea, Divider, PageIndicator
- **Typography**: Text, TextLink
- **Brand**: Logo
- **Avatar**: Avatar
- **Error**: ErrorBoundary

---

## Buttons

### Button

Reusable Button component following Ant Design principles with system colors. Supports multiple variants, sizes, icons, and states.

📖 **For detailed documentation, see [Button Component Guide](./BUTTON_GUIDE.md)**

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| title | string | - | Text hiển thị trên button (required) |
| onPress | () => void | - | Callback khi button được nhấn (required) |
| variant | 'primary' \| 'outline' \| 'ghost' \| 'text' | 'primary' | Kiểu hiển thị của button |
| size | 'small' \| 'medium' \| 'large' | 'medium' | Kích thước button |
| loading | boolean | false | Hiển thị loading indicator |
| disabled | boolean | false | Vô hiệu hóa button |
| fullWidth | boolean | false | Button chiếm toàn bộ chiều rộng |
| iconLeft | string | - | Icon name từ Ionicons (hiển thị bên trái) |
| iconRight | string | - | Icon name từ Ionicons (hiển thị bên phải) |
| style | ViewStyle | - | Custom button container styles |
| textStyle | ViewStyle | - | Custom text styles |

**Variants:**

- **primary**: Solid blue background with white text (main actions)
- **outline**: White background with blue border (secondary actions)
- **ghost**: Transparent background with blue border (tertiary actions)
- **text**: No background or border, only text (subtle actions)

**Usage:**

```typescript
import {Button} from '@/shared/components';

// Primary button
<Button
  title="Đăng nhập"
  onPress={handleLogin}
/>

// Outline button with icon
<Button
  title="Xem báo cáo"
  onPress={handleViewReport}
  variant="outline"
  iconLeft="stats-chart-outline"
/>

// Ghost button with icon
<Button
  title="Chỉnh sửa"
  onPress={handleEdit}
  variant="ghost"
  iconLeft="pencil"
/>

// Primary button with right icon
<Button
  title="Tiếp tục"
  onPress={handleContinue}
  iconRight="chevron-forward"
  fullWidth
/>

// Loading state
<Button
  title="Đang xử lý..."
  onPress={handleSubmit}
  loading={true}
/>

// Disabled button
<Button
  title="Submit"
  onPress={handleSubmit}
  disabled={!isFormValid}
/>
```

---

### BackButton

Component button quay lại với icon mũi tên, tự động xử lý navigation.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| onPress | () => void | - | Custom callback khi nhấn. Nếu không có, sẽ gọi `navigation.goBack()` |

**Usage:**

```typescript
import {BackButton} from '@/shared/components';

// Auto navigation back
<BackButton />

// Custom action
<BackButton onPress={handleCustomBack} />

// Trong header
<View style={styles.header}>
  <BackButton />
  <Text style={styles.title}>Chi tiết</Text>
</View>
```

**Ant Design Integration:**

Sử dụng ANTD-RN Button với `type="ghost"` và icon từ react-native-vector-icons.

---

### Badge

Component badge để hiển thị thông báo, trạng thái hoặc số lượng. Có thể dùng standalone hoặc wrap children.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | string \| number | - | Nội dung badge (text hoặc số) |
| variant | 'primary' \| 'success' \| 'warning' \| 'error' \| 'neutral' | 'primary' | Màu sắc badge |
| size | 'small' \| 'medium' | 'medium' | Kích thước badge |
| dot | boolean | false | Hiển thị dạng dot (không có text) |
| children | ReactNode | - | Children để wrap (cho notification badge) |
| style | ViewStyle | - | Custom styles |

**Usage:**

```typescript
import {Badge} from '@/shared/components';

// Standalone badge
<Badge label="New" variant="primary" />
<Badge label="Hot" variant="error" />
<Badge label={5} variant="warning" />

// Dot badge
<Badge dot variant="error" />

// Notification badge (wrap icon)
<Badge label={3} variant="error">
  <Ionicons name="notifications" size={24} />
</Badge>

// Small badge
<Badge label="Beta" variant="neutral" size="small" />

// Variants
<Badge label="Success" variant="success" />
<Badge label="Warning" variant="warning" />
<Badge label="Error" variant="error" />
```

**Ant Design Integration:**

Sử dụng ANTD-RN Badge với custom styling cho các variants.

---

## Forms

### Input

Reusable Input component following Ant Design principles with system colors. Supports labels, icons, validation, password visibility toggle, error states, and various keyboard types.

📖 **For detailed documentation, see [Input Component Guide](./INPUT_GUIDE.md)**

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | string | - | Label của input (required) |
| value | string | - | Giá trị input (required) |
| onChangeText | (text: string) => void | - | Callback khi text thay đổi (required) |
| placeholder | string | - | Placeholder text |
| onBlur | () => void | - | Callback khi input mất focus |
| icon | string | - | Icon bên trái (Ionicons name) |
| iconRight | string | - | Icon bên phải (Ionicons name) |
| onIconPress | () => void | - | Callback khi nhấn icon bên phải |
| secureTextEntry | boolean | false | Ẩn text (cho password) - tự động hiển thị toggle |
| keyboardType | 'default' \| 'email-address' \| 'numeric' \| 'phone-pad' \| ... | 'default' | Loại bàn phím |
| autoCapitalize | 'none' \| 'sentences' \| 'words' \| 'characters' | 'sentences' | Tự động viết hoa |
| error | string | - | Error message |
| required | boolean | false | Hiển thị dấu * bắt buộc |
| disabled | boolean | false | Vô hiệu hóa input |
| multiline | boolean | false | Cho phép nhiều dòng |
| numberOfLines | number | 1 | Số dòng (khi multiline) |
| containerStyle | ViewStyle | - | Custom container styles |
| inputStyle | ViewStyle | - | Custom input styles |

**Features:**

- Automatic password visibility toggle when `secureTextEntry={true}`
- Focus states with border color changes
- Error states with red border and error message
- Left and right icon support
- Disabled state with visual feedback
- Multiline support for longer text

**Usage:**

```typescript
import {Input} from '@/shared/components';

// Basic input
<Input
  label="Tên tài khoản"
  placeholder="Nhập tên tài khoản"
  value={name}
  onChangeText={setName}
/>

// Input with icon
<Input
  label="Email"
  placeholder="example@email.com"
  value={email}
  onChangeText={setEmail}
  icon="mail-outline"
  keyboardType="email-address"
  autoCapitalize="none"
/>

// Password input (automatic toggle)
<Input
  label="Mật khẩu"
  placeholder="Nhập mật khẩu"
  value={password}
  onChangeText={setPassword}
  secureTextEntry
/>

// Password with left icon
<Input
  label="Mật khẩu"
  placeholder="Nhập mật khẩu"
  value={password}
  onChangeText={setPassword}
  icon="lock-closed-outline"
  secureTextEntry
/>

// Input with error
<Input
  label="Email"
  placeholder="example@email.com"
  value={email}
  onChangeText={setEmail}
  error="Email không hợp lệ"
  required
/>

// Disabled input
<Input
  label="Email"
  placeholder="example@email.com"
  value="user@example.com"
  onChangeText={() => {}}
  disabled
/>

// Multiline input
<Input
  label="Ghi chú"
  placeholder="Nhập ghi chú..."
  value={note}
  onChangeText={setNote}
  multiline
  numberOfLines={4}
/>
```

**Ant Design Integration:**

Component sử dụng React Native TextInput với styling theo Ant Design principles và system colors.

---

### SegmentedControl (Tab)

Reusable Tab/Segmented Control component following Ant Design principles with system colors. Provides a tab-like interface for switching between multiple options.

📖 **For detailed documentation, see [Tab Component Guide](./TAB_GUIDE.md)**

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| options | string[] | - | Mảng các option labels (required) |
| selectedIndex | number | - | Index của option đang được chọn (required) |
| onSelect | (index: number) => void | - | Callback khi chọn option (required) |
| disabled | boolean | false | Vô hiệu hóa tất cả tabs |
| containerStyle | ViewStyle | - | Custom container styles |
| tabStyle | ViewStyle | - | Custom tab styles |
| textStyle | ViewStyle | - | Custom text styles |

**Features:**

- Clean Ant Design styling with system colors
- Selected state with white background and blue border
- Smooth transitions between states
- Disabled state support
- Customizable styling options

**Usage:**

```typescript
import {SegmentedControl} from '@/shared/components';
import {useState} from 'react';

// Basic usage
function MyScreen() {
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <>
      <SegmentedControl
        options={['Đăng nhập', 'Đăng ký']}
        selectedIndex={selectedTab}
        onSelect={setSelectedTab}
      />

      {selectedTab === 0 ? <LoginForm /> : <RegisterForm />}
    </>
  );
}

// Three options
<SegmentedControl
  options={['All', 'Active', 'Completed']}
  selectedIndex={filter}
  onSelect={setFilter}
/>

// Disabled state
<SegmentedControl
  options={['Option 1', 'Option 2']}
  selectedIndex={0}
  onSelect={() => {}}
  disabled
/>
```

**Ant Design Integration:**

Component sử dụng React Native với styling theo Ant Design principles và system colors.

---

## Layout

### Container

Component container cung cấp horizontal spacing nhất quán sử dụng ANTD-RN WingBlank.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | ReactNode | - | Children components (required) |
| padding | boolean | true | Áp dụng horizontal padding |
| style | ViewStyle | - | Custom styles |

**Usage:**

```typescript
import {Container} from '@/shared/components';

// With padding (default)
<Container>
  <Text>Nội dung với padding</Text>
</Container>

// Without padding
<Container padding={false}>
  <Image source={banner} style={{width: '100%'}} />
</Container>

// With custom style
<Container style={{backgroundColor: colors.backgroundSecondary}}>
  <Text>Custom background</Text>
</Container>
```

**Ant Design Integration:**

Sử dụng ANTD-RN WingBlank với size="md" để đảm bảo spacing nhất quán.

---

### SafeArea

Component SafeAreaView wrapper với background color mặc định.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | ReactNode | - | Children components (required) |
| style | ViewStyle | - | Custom styles |

**Usage:**

```typescript
import {SafeArea} from '@/shared/components';

// Basic usage
<SafeArea>
  <Header />
  <Content />
</SafeArea>

// With custom background
<SafeArea style={{backgroundColor: colors.primary}}>
  <Content />
</SafeArea>

// Typical screen structure
function MyScreen() {
  return (
    <SafeArea>
      <Container>
        <Text>Screen content</Text>
      </Container>
    </SafeArea>
  );
}
```

---

### Divider

Component divider (đường phân cách) với optional text ở giữa.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| text | string | - | Text hiển thị ở giữa divider |
| textColor | string | colors.textSecondary | Màu text |
| lineColor | string | colors.border | Màu đường kẻ |

**Usage:**

```typescript
import {Divider} from '@/shared/components';

// Simple divider
<Divider />

// Divider with text
<Divider text="HOẶC" />

// Custom colors
<Divider
  text="Hoặc đăng nhập với"
  textColor={colors.text}
  lineColor={colors.gray[300]}
/>

// In a form
<Input label="Email" {...emailProps} />
<Divider text="HOẶC" />
<Button title="Đăng nhập với Google" {...googleProps} />
```

---

### PageIndicator

Component dots indicator cho pagination hoặc carousel.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| totalPages | number | - | Tổng số pages (required) |
| currentPage | number | - | Page hiện tại (0-indexed) (required) |
| activeColor | string | colors.primary | Màu dot active |
| inactiveColor | string | colors.border | Màu dot inactive |

**Usage:**

```typescript
import {PageIndicator} from '@/shared/components';
import {useState} from 'react';

function OnboardingScreen() {
  const [currentPage, setCurrentPage] = useState(0);

  return (
    <View>
      <Carousel onPageChange={setCurrentPage}>
        {/* Carousel content */}
      </Carousel>

      <PageIndicator
        totalPages={3}
        currentPage={currentPage}
      />
    </View>
  );
}

// Custom colors
<PageIndicator
  totalPages={5}
  currentPage={2}
  activeColor={colors.success}
  inactiveColor={colors.gray[200]}
/>
```

---

## Typography

### Text

Component text với các variants và weights được định nghĩa sẵn.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | ReactNode | - | Text content (required) |
| variant | 'h1' \| 'h2' \| 'h3' \| 'body' \| 'caption' \| 'small' | 'body' | Variant của text |
| weight | 'regular' \| 'medium' \| 'semibold' \| 'bold' | 'regular' | Font weight |
| color | string | colors.text | Màu text |
| align | 'left' \| 'center' \| 'right' | 'left' | Text alignment |
| style | TextStyle | - | Custom styles |

**Usage:**

```typescript
import {Text} from '@/shared/components';

// Headings
<Text variant="h1">Tiêu đề lớn</Text>
<Text variant="h2">Tiêu đề vừa</Text>
<Text variant="h3">Tiêu đề nhỏ</Text>

// Body text
<Text variant="body">Nội dung chính</Text>
<Text variant="caption">Chú thích</Text>
<Text variant="small">Text nhỏ</Text>

// With weight
<Text variant="h2" weight="bold">Tiêu đề đậm</Text>
<Text variant="body" weight="medium">Text medium</Text>

// With color
<Text color={colors.primary}>Text màu primary</Text>
<Text color={colors.error}>Text lỗi</Text>

// With alignment
<Text align="center">Text căn giữa</Text>
<Text align="right">Text căn phải</Text>

// Combined
<Text
  variant="h3"
  weight="semibold"
  color={colors.primary}
  align="center"
>
  Tiêu đề đặc biệt
</Text>
```

---

### TextLink

Reusable TextLink component following Ant Design principles with system colors. Supports simple links, text with links, and multiple links in a single line.

📖 **For detailed documentation, see [TextLink Component Guide](./TEXT_LINK_GUIDE.md)**

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| linkText | string | - | Simple link text (for simple link mode) |
| onPress | () => void | - | Callback when simple link is pressed |
| text | string | - | Regular text before link |
| textAfter | string | - | Regular text after link |
| links | LinkItem[] | - | Multiple links with text |
| align | 'left' \| 'center' \| 'right' | 'left' | Alignment of the text |
| linkColor | string | colors.primary | Link color |
| textColor | string | colors.textSecondary | Text color |
| fontSize | number | typography.fontSize.sm | Font size |
| containerStyle | ViewStyle | - | Custom container styles |
| textStyle | TextStyle | - | Custom text styles |
| linkStyle | TextStyle | - | Custom link styles |

**Features:**

- Simple link mode (standalone link)
- Text + link mode (text with clickable link)
- Multiple links mode (text with multiple clickable links)
- Alignment options (left, center, right)
- Customizable colors and styles

**Usage:**

```typescript
import {TextLink} from '@/shared/components';

// Simple link
<TextLink
  linkText="Forgot Password?"
  onPress={handleForgotPassword}
/>

// Text with link
<TextLink
  text="Don't have an account?"
  linkText="Sign up"
  onPress={handleSignUp}
/>

// Multiple links
<TextLink
  text="Bằng việc đăng kí, bạn đã đồng ý với Mebione về"
  links={[
    { text: 'Điều khoản dịch vụ', onPress: handleTerms },
    { text: 'Chính sách bảo mật', onPress: handlePrivacy },
  ]}
/>

// Right aligned
<TextLink
  linkText="Forgot Password?"
  onPress={handleForgotPassword}
  align="right"
/>

// Custom colors
<TextLink
  text="Custom:"
  linkText="Click here"
  onPress={handleClick}
  linkColor={colors.error}
  textColor={colors.text}
/>
```

**Ant Design Integration:**

Component sử dụng React Native với styling theo Ant Design principles và system colors.

---

## Brand

### Logo

Component hiển thị logo của ứng dụng với các sizes khác nhau.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | 'small' \| 'medium' \| 'large' | 'small' | Kích thước logo |

**Sizes:**
- `small`: 80x30
- `medium`: 120x45
- `large`: 160x60

**Usage:**

```typescript
import {Logo} from '@/shared/components';

// Small logo (default)
<Logo />

// Medium logo
<Logo size="medium" />

// Large logo
<Logo size="large" />

// In header
<View style={styles.header}>
  <Logo size="small" />
</View>

// In splash screen
<View style={styles.splash}>
  <Logo size="large" />
</View>
```

**Note:** Logo image được load từ `@/assets/images/Mebione-logov2.png`.

---

## Avatar

### Avatar

Component avatar hiển thị ảnh người dùng hoặc initials.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| source | {uri: string} \| number | - | Image source (URI hoặc require) |
| name | string | - | Tên để tạo initials (nếu không có source) |
| size | 'small' \| 'medium' \| 'large' | 'medium' | Kích thước avatar |
| style | ViewStyle | - | Custom styles |

**Sizes:**
- `small`: 40x40
- `medium`: 56x56
- `large`: 80x80

**Usage:**

```typescript
import {Avatar} from '@/shared/components';

// With image URL
<Avatar
  source={{uri: 'https://example.com/avatar.jpg'}}
  size="medium"
/>

// With local image
<Avatar
  source={require('@/assets/images/avatar.png')}
  size="large"
/>

// With initials (no image)
<Avatar
  name="Nguyễn Văn A"
  size="small"
/>

// In user profile
<View style={styles.profile}>
  <Avatar
    source={{uri: user.avatarUrl}}
    name={user.name}
    size="large"
  />
  <Text>{user.name}</Text>
</View>

// In list item
<View style={styles.listItem}>
  <Avatar
    name={item.userName}
    size="small"
  />
  <Text>{item.userName}</Text>
</View>
```

**Note:** Khi không có `source`, component sẽ hiển thị initials từ `name` với background màu xanh.

---

## Error

### ErrorBoundary

Component Error Boundary để catch và xử lý errors trong React component tree.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | ReactNode | - | Children components (required) |
| fallback | ReactNode | - | Custom fallback UI khi có error |

**Usage:**

```typescript
import {ErrorBoundary} from '@/shared/components';

// Wrap entire app
function App() {
  return (
    <ErrorBoundary>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </ErrorBoundary>
  );
}

// Wrap specific feature
function FeatureScreen() {
  return (
    <ErrorBoundary>
      <ComplexFeature />
    </ErrorBoundary>
  );
}

// With custom fallback
<ErrorBoundary
  fallback={
    <View style={styles.error}>
      <Text>Đã có lỗi xảy ra</Text>
      <Button title="Tải lại" onPress={reload} />
    </View>
  }
>
  <MyComponent />
</ErrorBoundary>
```

**Features:**
- Tự động catch errors trong component tree
- Hiển thị friendly error message cho users
- Hiển thị error details trong development mode
- Có button "Try Again" để reset error state
- Log errors ra console (có thể tích hợp với error reporting service như Sentry)

**Note:** Error details chỉ hiển thị trong development mode (`__DEV__`).

---

## Component Best Practices

### Khi nào tạo component mới vs sử dụng component có sẵn

**Sử dụng component có sẵn khi:**
- Component đáp ứng đủ requirements
- Chỉ cần customize nhẹ qua props hoặc style
- Muốn đảm bảo consistency trong app

**Tạo component mới khi:**
- Cần functionality hoàn toàn khác
- Component sẽ được reuse nhiều lần
- Logic phức tạp và cần encapsulate

### Styling Components

```typescript
// ✅ Good - Sử dụng design system
<Button
  title="Submit"
  style={{marginTop: spacing.lg}}
/>

<Text
  variant="h2"
  color={colors.primary}
>
  Title
</Text>

// ❌ Bad - Hardcode values
<Button
  title="Submit"
  style={{marginTop: 20}}
/>

<Text style={{fontSize: 24, color: '#007AFF'}}>
  Title
</Text>
```

### Component Composition

```typescript
// ✅ Good - Compose components
<SafeArea>
  <Container>
    <Text variant="h1">Welcome</Text>
    <Button title="Get Started" onPress={handleStart} />
  </Container>
</SafeArea>

// ✅ Good - Reusable patterns
function FormField({label, error, ...inputProps}) {
  return (
    <View>
      <Input label={label} error={error} {...inputProps} />
    </View>
  );
}
```

### Performance Considerations

```typescript
// ✅ Good - Memoize callbacks
const handlePress = useCallback(() => {
  // Handle press
}, [dependencies]);

<Button title="Press" onPress={handlePress} />

// ✅ Good - Avoid inline styles
const styles = StyleSheet.create({
  button: {
    marginTop: spacing.lg,
  },
});

<Button title="Press" style={styles.button} />

// ❌ Bad - Inline object creation
<Button
  title="Press"
  style={{marginTop: spacing.lg}} // Creates new object on every render
/>
```

### Import Best Practices

```typescript
// ✅ Good - Import từ shared components index
import {Button, Input, Text} from '@/shared/components';

// ✅ Good - Import specific category
import {Button, BackButton, Badge} from '@/shared/components/buttons';

// ❌ Bad - Import trực tiếp từ file
import {Button} from '@/shared/components/buttons/Button';
```

### Accessibility

```typescript
// ✅ Good - Provide accessible labels
<Button
  title="Đóng"
  onPress={handleClose}
  accessibilityLabel="Đóng modal"
  accessibilityHint="Nhấn để đóng modal này"
/>

// ✅ Good - Use semantic components
<Text variant="h1">Tiêu đề chính</Text> // Better than custom styled text
```

### Error Handling

```typescript
// ✅ Good - Wrap risky components
<ErrorBoundary>
  <ComplexFeature />
</ErrorBoundary>

// ✅ Good - Show error states
<Input
  label="Email"
  value={email}
  onChangeText={setEmail}
  error={emailError}
/>
```

### Testing Components

```typescript
// ✅ Good - Test component behavior
it('should call onPress when button is pressed', () => {
  const onPress = jest.fn();
  const {getByText} = render(<Button title="Press" onPress={onPress} />);

  fireEvent.press(getByText('Press'));
  expect(onPress).toHaveBeenCalled();
});

// ✅ Good - Test error states
it('should display error message', () => {
  const {getByText} = render(
    <Input
      label="Email"
      value=""
      onChangeText={() => {}}
      error="Email is required"
    />
  );

  expect(getByText('Email is required')).toBeTruthy();
});
```

---

## Ant Design Integration Notes

Nhiều components trong dự án sử dụng Ant Design React Native (ANTD-RN) làm foundation:

### Components sử dụng ANTD-RN:

1. **Button** - Wrap ANTD-RN Button
   - Maps custom variants to ANTD types
   - Maintains backward compatibility

2. **Input** - Sử dụng ANTD-RN InputItem và List
   - Custom wrapper để support icons
   - Enhanced styling và validation

3. **SegmentedControl** - Sử dụng ANTD-RN theme
   - Custom implementation với ANTD styling
   - Consistent với design system

4. **Container** - Sử dụng ANTD-RN WingBlank
   - Provides consistent horizontal spacing
   - Integrates với ANTD spacing system

5. **Badge** - Wrap ANTD-RN Badge
   - Custom variants và colors
   - Support cả standalone và notification badges

### ANTD Theme Configuration

Project có custom ANTD theme tại `@/core/config/antd-theme`. Khi tạo components mới sử dụng ANTD-RN, nên:

1. Import theme: `import {antdTheme} from '@/core/config/antd-theme'`
2. Sử dụng theme values thay vì hardcode
3. Fallback về design system values nếu theme không có

### Khi nào sử dụng ANTD-RN components:

- ✅ Khi ANTD có component phù hợp
- ✅ Khi cần consistency với existing ANTD components
- ✅ Khi component phức tạp và ANTD đã implement tốt

### Khi nào tạo custom components:

- ✅ Khi ANTD không có component cần thiết
- ✅ Khi cần customize nhiều và wrap ANTD phức tạp
- ✅ Khi performance là concern (ANTD có thể heavy)

---

## Related Documentation

- [Architecture Guide](./ARCHITECTURE.md) - Hiểu về domain-driven architecture
- [Styles Guide](./STYLES_GUIDE.md) - Design system và styling
- [Conventions](./CONVENTIONS.md) - Naming và organization conventions
- [API Guide](./API_GUIDE.md) - API integration patterns

---

**Lưu ý:** Documentation này được cập nhật dựa trên codebase hiện tại. Khi thêm components mới, hãy cập nhật document này theo template đã định nghĩa.
