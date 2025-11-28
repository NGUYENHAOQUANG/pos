# Input Component Guide

## Overview

The `Input` component is a reusable, customizable text input field that follows Ant Design principles and uses the system's design tokens. It supports labels, icons, validation, password visibility toggle, error states, and various keyboard types to provide a consistent user experience across the application.

## Installation

The Input component is part of the shared components library and can be imported as follows:

```typescript
import { Input } from '@/shared/components';
```

## Props

| Prop              | Type                                                                      | Default      | Required | Description                                    |
| ----------------- | ------------------------------------------------------------------------- | ------------ | -------- | ---------------------------------------------- |
| `label`           | `string`                                                                  | -            | ✅ Yes   | Label text displayed above the input           |
| `value`           | `string`                                                                  | -            | ✅ Yes   | Input value                                     |
| `onChangeText`    | `(text: string) => void`                                                  | -            | ✅ Yes   | Callback when text changes                      |
| `placeholder`     | `string`                                                                  | -            | No       | Placeholder text                                |
| `onBlur`          | `() => void`                                                              | -            | No       | Callback when input loses focus                 |
| `icon`            | `string`                                                                  | -            | No       | Icon name from Ionicons (left side)            |
| `iconRight`       | `string`                                                                  | -            | No       | Icon name from Ionicons (right side)            |
| `onIconPress`     | `() => void`                                                              | -            | No       | Callback when right icon is pressed             |
| `secureTextEntry` | `boolean`                                                                 | `false`      | No       | Hide text input (for passwords)                 |
| `error`           | `string`                                                                  | -            | No       | Error message to display                        |
| `required`        | `boolean`                                                                 | `false`      | No       | Show required indicator (\*)                    |
| `disabled`        | `boolean`                                                                 | `false`      | No       | Disable input interaction                       |
| `keyboardType`    | `'default' \| 'email-address' \| 'numeric' \| 'phone-pad' \| ...`      | `'default'`  | No       | Keyboard type                                   |
| `autoCapitalize`  | `'none' \| 'sentences' \| 'words' \| 'characters'`                       | `'sentences'`| No       | Auto capitalization setting                     |
| `multiline`       | `boolean`                                                                 | `false`      | No       | Allow multiple lines                            |
| `numberOfLines`   | `number`                                                                  | `1`          | No       | Number of lines (when multiline)                |
| `containerStyle` | `ViewStyle`                                                               | -            | No       | Custom container styles                         |
| `inputStyle`      | `ViewStyle`                                                               | -            | No       | Custom input styles                             |

The Input component also accepts all standard React Native `TextInput` props.

## Basic Usage

### Simple Input

```typescript
import { Input } from '@/shared/components';
import { useState } from 'react';

function MyForm() {
  const [name, setName] = useState('');

  return (
    <Input
      label="Account Name"
      placeholder="Enter account name"
      value={name}
      onChangeText={setName}
    />
  );
}
```

### Input with Controlled Value

```typescript
function ControlledInput() {
  const [value, setValue] = useState('');

  return (
    <Input
      label="Username"
      placeholder="Enter username"
      value={value}
      onChangeText={setValue}
    />
  );
}
```

## Input Types

### Text Input

Standard text input for general use.

```typescript
<Input
  label="Full Name"
  placeholder="Enter your full name"
  value={name}
  onChangeText={setName}
/>
```

### Email Input

Email input with appropriate keyboard type.

```typescript
<Input
  label="Email"
  placeholder="example@email.com"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  autoCapitalize="none"
/>
```

### Phone Number Input

Phone number input with numeric keyboard.

```typescript
<Input
  label="Phone Number"
  placeholder="0123456789"
  value={phone}
  onChangeText={setPhone}
  keyboardType="phone-pad"
/>
```

### Numeric Input

Numeric input for numbers only.

```typescript
<Input
  label="Age"
  placeholder="Enter age"
  value={age}
  onChangeText={setAge}
  keyboardType="numeric"
/>
```

## Icons

### Left Icon

Icons can be displayed on the left side of the input to provide visual context.

```typescript
<Input
  label="Email"
  placeholder="example@email.com"
  value={email}
  onChangeText={setEmail}
  icon="mail-outline"
  keyboardType="email-address"
/>
```

### Right Icon

Icons can be displayed on the right side for actions like search or clear.

```typescript
<Input
  label="Search"
  placeholder="Enter keyword..."
  value={search}
  onChangeText={setSearch}
  iconRight="search-outline"
  onIconPress={handleSearch}
/>
```

### Clear Button

Use right icon to clear input value.

```typescript
<Input
  label="Search"
  placeholder="Enter keyword..."
  value={search}
  onChangeText={setSearch}
  iconRight="close-circle"
  onIconPress={() => setSearch('')}
/>
```

**Common Icon Names:**

- `mail-outline` - Email icon
- `call-outline` - Phone icon
- `lock-closed-outline` - Lock/Password icon
- `person-outline` - User icon
- `search-outline` - Search icon
- `close-circle` - Close/Clear icon
- `eye-outline` / `eye-off-outline` - Password visibility (auto-handled)

## Password Inputs

### Basic Password Input

The Input component automatically handles password visibility toggle when `secureTextEntry` is enabled.

```typescript
<Input
  label="Password"
  placeholder="Enter password"
  value={password}
  onChangeText={setPassword}
  secureTextEntry
/>
```

**Behavior:**

- Automatically shows eye icon on the right
- Toggles between `eye-outline` and `eye-off-outline`
- Clicking the icon toggles password visibility
- No need to manually manage `iconRight` for password inputs

### Password with Left Icon

```typescript
<Input
  label="Password"
  placeholder="Enter password"
  value={password}
  onChangeText={setPassword}
  icon="lock-closed-outline"
  secureTextEntry
/>
```

### Custom Password Toggle

If you need custom password toggle behavior, you can use `iconRight` and `onIconPress`:

```typescript
const [showPassword, setShowPassword] = useState(false);

<Input
  label="Password"
  placeholder="Enter password"
  value={password}
  onChangeText={setPassword}
  icon="lock-closed-outline"
  iconRight={showPassword ? 'eye-outline' : 'eye-off-outline'}
  onIconPress={() => setShowPassword(!showPassword)}
  secureTextEntry={!showPassword}
/>
```

## Validation and Error States

### Required Fields

Show a required indicator with an asterisk.

```typescript
<Input
  label="Email"
  placeholder="example@email.com"
  value={email}
  onChangeText={setEmail}
  required
/>
```

### Error State

Display error messages below the input. The input border will turn red.

```typescript
<Input
  label="Email"
  placeholder="example@email.com"
  value={email}
  onChangeText={setEmail}
  error="Email is required"
/>
```

### Validation Example

```typescript
function EmailInput() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (text: string) => {
    setEmail(text);
    if (text && !text.includes('@')) {
      setError('Please enter a valid email address');
    } else {
      setError('');
    }
  };

  return (
    <Input
      label="Email"
      placeholder="example@email.com"
      value={email}
      onChangeText={validateEmail}
      keyboardType="email-address"
      autoCapitalize="none"
      error={error}
      required
    />
  );
}
```

**Error State Behavior:**

- Border color changes to error color (red)
- Error message appears below input
- Icon color changes to error color when focused or in error state

## Disabled State

Disabled inputs are non-interactive and visually indicate that the field is not editable.

```typescript
<Input
  label="Email"
  placeholder="example@email.com"
  value="user@example.com"
  onChangeText={() => {}}
  disabled
/>
```

**Visual Behavior:**

- Reduced opacity (60%)
- Gray background
- No touch interaction
- Maintains visual hierarchy

## Multiline Inputs

For longer text input, use multiline mode.

```typescript
<Input
  label="Notes"
  placeholder="Enter notes..."
  value={notes}
  onChangeText={setNotes}
  multiline
  numberOfLines={4}
/>
```

**Multiline Behavior:**

- Input expands vertically
- Text aligns to top
- `numberOfLines` sets initial height
- Scrollable when content exceeds height

## Focus States

The Input component automatically handles focus states:

- **Default**: Gray border
- **Focused**: Blue border (primary color), slightly thicker
- **Error**: Red border
- **Disabled**: Gray background, reduced opacity

Focus state is managed internally and updates border color and icon colors automatically.

## Examples

### Login Form

```typescript
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });

  const handleLogin = () => {
    // Validation logic
    if (!email) {
      setErrors({ ...errors, email: 'Email is required' });
      return;
    }
    if (!password) {
      setErrors({ ...errors, password: 'Password is required' });
      return;
    }
    // Login logic
  };

  return (
    <>
      <Input
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        icon="mail-outline"
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
        required
      />
      <Input
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        icon="lock-closed-outline"
        secureTextEntry
        error={errors.password}
        required
      />
    </>
  );
}
```

### Registration Form

```typescript
function RegistrationForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  return (
    <>
      <Input
        label="Full Name"
        placeholder="Enter your full name"
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
        required
      />
      <Input
        label="Email"
        placeholder="example@email.com"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
        icon="mail-outline"
        keyboardType="email-address"
        autoCapitalize="none"
        required
      />
      <Input
        label="Phone Number"
        placeholder="0123456789"
        value={formData.phone}
        onChangeText={(text) => setFormData({ ...formData, phone: text })}
        icon="call-outline"
        keyboardType="phone-pad"
        required
      />
      <Input
        label="Password"
        placeholder="Enter password"
        value={formData.password}
        onChangeText={(text) => setFormData({ ...formData, password: text })}
        icon="lock-closed-outline"
        secureTextEntry
        required
      />
    </>
  );
}
```

### Search Input

```typescript
function SearchInput() {
  const [query, setQuery] = useState('');

  return (
    <Input
      label="Search"
      placeholder="Enter keyword..."
      value={query}
      onChangeText={setQuery}
      icon="search-outline"
      iconRight={query ? 'close-circle' : undefined}
      onIconPress={() => setQuery('')}
    />
  );
}
```

### Form with Validation

```typescript
function ValidatedForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (text: string) => {
    setEmail(text);
    if (!text) {
      setEmailError('Email is required');
    } else if (!text.includes('@')) {
      setEmailError('Invalid email format');
    } else {
      setEmailError('');
    }
  };

  const validatePassword = (text: string) => {
    setPassword(text);
    if (!text) {
      setPasswordError('Password is required');
    } else if (text.length < 8) {
      setPasswordError('Password must be at least 8 characters');
    } else {
      setPasswordError('');
    }
  };

  return (
    <>
      <Input
        label="Email"
        placeholder="example@email.com"
        value={email}
        onChangeText={validateEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        error={emailError}
        required
      />
      <Input
        label="Password"
        placeholder="Enter password"
        value={password}
        onChangeText={validatePassword}
        secureTextEntry
        error={passwordError}
        required
      />
    </>
  );
}
```

## Best Practices

### 1. Always Use Labels

Labels provide context and improve accessibility. Always include a descriptive label.

```typescript
// ✅ Good
<Input label="Email" ... />

// ❌ Bad
<Input placeholder="Email" ... />
```

### 2. Use Appropriate Keyboard Types

Choose the correct keyboard type to improve user experience:

- `email-address` for emails
- `phone-pad` for phone numbers
- `numeric` for numbers
- `default` for general text

### 3. Handle Password Visibility

Let the component handle password visibility automatically. Only use custom toggle if you need special behavior.

```typescript
// ✅ Good - Automatic toggle
<Input secureTextEntry ... />

// ✅ Good - Custom toggle if needed
<Input secureTextEntry iconRight={...} onIconPress={...} />
```

### 4. Provide Clear Error Messages

Error messages should be clear and actionable.

```typescript
// ✅ Good
error="Password must be at least 8 characters"

// ❌ Bad
error="Invalid"
```

### 5. Use Icons Appropriately

Icons should enhance understanding, not replace labels.

- Use left icons for input type (email, phone, etc.)
- Use right icons for actions (search, clear, etc.)
- Don't overuse icons

### 6. Validate on Blur

For better UX, validate inputs when they lose focus rather than on every keystroke.

```typescript
const [error, setError] = useState('');

const handleBlur = () => {
  if (!value) {
    setError('This field is required');
  }
};

<Input onBlur={handleBlur} error={error} ... />
```

### 7. Accessibility

- Always provide labels
- Use appropriate keyboard types
- Ensure sufficient color contrast
- Test with screen readers

### 8. Controlled Components

Always use controlled components with `value` and `onChangeText`.

```typescript
// ✅ Good
const [value, setValue] = useState('');
<Input value={value} onChangeText={setValue} ... />

// ❌ Bad
<Input defaultValue="..." ... />
```

## Design Tokens

The Input component uses the following design tokens from the system:

**Colors:**

- Border: `colors.border` (#E5E7EB)
- Border Focused: `colors.primary` (#007AFF)
- Border Error: `colors.error` (#FF3B30)
- Text: `colors.text` (#111827)
- Text Secondary: `colors.textSecondary` (#6B7280)
- Text Tertiary: `colors.textTertiary` (#9CA3AF)
- Background: `colors.white` (#FFFFFF)
- Background Disabled: `colors.backgroundSecondary` (#F9FAFB)

**Sizes:**

- Input Height: `sizes.input.md` (44px)
- Icon Size: `sizes.icon.sm` (20px)

**Spacing:**

- Horizontal Padding: `spacing.md` (16px)
- Label Margin: `spacing.xs` (4px)
- Icon Spacing: `spacing.sm` (8px)
- Container Margin: `spacing.lg` (24px)

**Typography:**

- Label Font Size: `typography.fontSize.sm` (14px)
- Input Font Size: `typography.fontSize.base` (16px)
- Error Font Size: `typography.fontSize.xs` (12px)
- Font Family: `typography.fontFamily.regular`

**Border Radius:**

- Input: `borderRadius.md` (12px)

## Troubleshooting

### Input not responding to text changes

- Ensure `value` and `onChangeText` are properly connected
- Check if input is disabled
- Verify controlled component pattern is used correctly

### Password toggle not working

- Ensure `secureTextEntry={true}` is set
- Don't set `iconRight` when using automatic password toggle
- Check if `onIconPress` is interfering

### Icons not displaying

- Verify icon name exists in Ionicons library
- Check icon name spelling (case-sensitive)
- Ensure `react-native-vector-icons` is properly linked
- For iOS, ensure fonts are included in Info.plist

### Error state not showing

- Ensure `error` prop contains a non-empty string
- Check if custom styles are overriding error styles
- Verify error state logic in parent component

### Focus state issues

- Check if custom styles are interfering
- Ensure `onBlur` and `onFocus` are not being overridden
- Verify design tokens are properly imported

### Multiline input issues

- Ensure `multiline={true}` is set
- Set appropriate `numberOfLines`
- Check container height constraints

## Related Components

- **Button**: Often used with Input in forms
- **SegmentedControl**: Alternative input for selection
- **Text**: Used for labels and error messages

## References

- [Ant Design React Native InputItem](https://rn.mobile.ant.design/components/input-item)
- [React Native TextInput](https://reactnative.dev/docs/textinput)
- [Ionicons Documentation](https://ionic.io/ionicons)
- [Design System Documentation](./STYLES_GUIDE.md)

