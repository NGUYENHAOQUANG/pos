# Button Component Guide

## Overview

The `Button` component is a reusable, customizable button component that follows Ant Design principles and uses the system's design tokens. It supports multiple variants, sizes, icons, and states to provide a consistent user experience across the application.

## Installation

The Button component is part of the shared components library and can be imported as follows:

```typescript
import { Button } from '@/shared/components';
```

## Props

| Prop        | Type                                          | Default     | Required | Description                                  |
| ----------- | --------------------------------------------- | ----------- | -------- | -------------------------------------------- |
| `title`     | `string`                                      | -           | ✅ Yes   | Text to display on the button                |
| `onPress`   | `() => void`                                  | -           | ✅ Yes   | Callback function when button is pressed     |
| `variant`   | `'primary' \| 'outline' \| 'ghost' \| 'text'` | `'primary'` | No       | Button style variant                         |
| `size`      | `'small' \| 'medium' \| 'large'`              | `'medium'`  | No       | Button size                                  |
| `loading`   | `boolean`                                     | `false`     | No       | Show loading indicator                       |
| `disabled`  | `boolean`                                     | `false`     | No       | Disable button interaction                   |
| `fullWidth` | `boolean`                                     | `false`     | No       | Button takes full width of container         |
| `iconLeft`  | `string`                                      | -           | No       | Icon name from Ionicons (displayed on left)  |
| `iconRight` | `string`                                      | -           | No       | Icon name from Ionicons (displayed on right) |
| `style`     | `ViewStyle`                                   | -           | No       | Custom button container styles               |
| `textStyle` | `ViewStyle`                                   | -           | No       | Custom text styles                           |

## Variants

### Primary

The primary variant is the main call-to-action button. It features a solid blue background with white text.

```typescript
<Button title="Create Account" onPress={handleCreateAccount} variant="primary" />
```

**Use cases:**

- Primary actions (submit, confirm, create)
- Important user actions
- Main navigation buttons

### Outline

The outline variant has a white background with a blue border and blue text. It's used for secondary actions.

```typescript
<Button title="View Report" onPress={handleViewReport} variant="outline" />
```

**Use cases:**

- Secondary actions
- Alternative options
- Less prominent actions

### Ghost

The ghost variant has a transparent background with a blue border and blue text. It's used for tertiary actions.

```typescript
<Button title="Edit" onPress={handleEdit} variant="ghost" iconLeft="pencil" />
```

**Use cases:**

- Tertiary actions
- Actions within cards or containers
- Less emphasized options

### Text

The text variant has no background or border, only text. It's used for subtle actions.

```typescript
<Button title="Learn More" onPress={handleLearnMore} variant="text" />
```

**Use cases:**

- Subtle actions
- Link-like buttons
- Less important actions

## Sizes

### Small

Small buttons are compact and suitable for inline actions or dense layouts.

```typescript
<Button title="Save" onPress={handleSave} size="small" />
```

**Dimensions:**

- Height: 32px
- Font size: 14px
- Padding: 16px horizontal, 4px vertical

### Medium (Default)

Medium buttons are the standard size for most use cases.

```typescript
<Button title="Continue" onPress={handleContinue} size="medium" />
```

**Dimensions:**

- Height: 44px
- Font size: 16px
- Padding: 24px horizontal, 8px vertical

### Large

Large buttons are prominent and suitable for important actions or mobile-first designs.

```typescript
<Button title="Get Started" onPress={handleGetStarted} size="large" />
```

**Dimensions:**

- Height: 52px
- Font size: 18px
- Padding: 32px horizontal, 16px vertical

## Icons

The Button component supports icons from Ionicons library. Icons can be placed on the left, right, or both sides of the text.

### Left Icon

```typescript
<Button title="Create Pond" onPress={handleCreatePond} iconLeft="add" />
```

### Right Icon

```typescript
<Button title="Continue" onPress={handleContinue} iconRight="chevron-forward" />
```

### Both Icons

```typescript
<Button title="Settings" onPress={handleSettings} iconLeft="settings" iconRight="chevron-forward" />
```

**Icon Behavior:**

- Icon color automatically matches the button variant
- Icon size adjusts based on button size
- Icons are properly spaced from text

**Common Icon Names:**

- `add` - Plus icon
- `chevron-forward` - Right arrow
- `arrow-back` - Left arrow
- `pencil` - Edit icon
- `stats-chart-outline` - Chart icon
- `settings` - Settings icon
- `checkmark` - Check icon
- `close` - Close icon

For a complete list of available icons, refer to the [Ionicons documentation](https://ionic.io/ionicons).

## States

### Loading State

When a button is in a loading state, it displays an activity indicator instead of the text and icons. The button is automatically disabled during loading.

```typescript
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await submitForm();
  } finally {
    setLoading(false);
  }
};

<Button title="Submit" onPress={handleSubmit} loading={loading} />;
```

**Behavior:**

- Button is disabled when `loading={true}`
- Loading indicator color matches button variant
- Text and icons are hidden during loading

### Disabled State

Disabled buttons are non-interactive and visually indicate that the action is not available.

```typescript
<Button title="Submit" onPress={handleSubmit} disabled={!isFormValid} />
```

**Visual Behavior:**

- Reduced opacity (50% for button, 70% for text)
- No touch interaction
- Maintains visual hierarchy

## Layout Options

### Full Width

Buttons can span the full width of their container using the `fullWidth` prop.

```typescript
<Button title="Continue" onPress={handleContinue} fullWidth />
```

**Use cases:**

- Mobile-first designs
- Form submissions
- Primary actions in modals or screens

### Custom Styling

You can apply custom styles to both the button container and text using `style` and `textStyle` props.

```typescript
<Button
  title="Custom Button"
  onPress={handlePress}
  style={{ marginTop: 20 }}
  textStyle={{ fontWeight: 'bold' }}
/>
```

**Note:** Custom styles will override default styles. Use with caution to maintain design consistency.

## Examples

### Basic Usage

```typescript
import { Button } from '@/shared/components';

function MyScreen() {
  const handlePress = () => {
    console.log('Button pressed');
  };

  return <Button title="Click Me" onPress={handlePress} />;
}
```

### Form Submission

```typescript
function LoginForm() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return <Button title="Login" onPress={handleLogin} loading={loading} fullWidth />;
}
```

### Action Buttons with Icons

```typescript
function ActionButtons() {
  return (
    <>
      <Button
        title="Create Account"
        onPress={handleCreate}
        variant="primary"
        iconLeft="person-add"
        fullWidth
      />
      <Button
        title="View Report"
        onPress={handleView}
        variant="outline"
        iconLeft="stats-chart-outline"
        fullWidth
      />
      <Button title="Edit" onPress={handleEdit} variant="ghost" iconLeft="pencil" />
    </>
  );
}
```

### Navigation Buttons

```typescript
function NavigationButtons() {
  return (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <Button
        title="Back"
        onPress={handleBack}
        variant="outline"
        iconLeft="arrow-back"
        style={{ flex: 1 }}
      />
      <Button
        title="Continue"
        onPress={handleContinue}
        variant="primary"
        iconRight="chevron-forward"
        style={{ flex: 1 }}
      />
    </View>
  );
}
```

### Conditional Rendering

```typescript
function ConditionalButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Button
      title={isLoggedIn ? 'Logout' : 'Login'}
      onPress={isLoggedIn ? handleLogout : handleLogin}
      variant={isLoggedIn ? 'outline' : 'primary'}
      disabled={!isNetworkAvailable}
    />
  );
}
```

## Best Practices

### 1. Choose the Right Variant

- **Primary**: Use for the main action on a screen (submit, confirm, create)
- **Outline**: Use for secondary actions (cancel, view, edit)
- **Ghost**: Use for tertiary actions or actions within cards
- **Text**: Use for subtle, less important actions

### 2. Button Hierarchy

Maintain a clear visual hierarchy:

- One primary button per screen
- Use outline/ghost for secondary actions
- Use text variant for less important actions

### 3. Button Labels

- Use clear, action-oriented labels
- Keep labels concise (1-3 words)
- Use verbs for actions (e.g., "Save", "Delete", "Continue")

### 4. Loading States

- Always show loading state for async operations
- Disable button during loading to prevent double submissions
- Provide feedback to users about the action in progress

### 5. Disabled States

- Disable buttons when actions are not available
- Provide clear visual feedback
- Consider showing tooltips or messages explaining why a button is disabled

### 6. Icon Usage

- Use icons to enhance clarity, not replace text
- Choose icons that are universally understood
- Maintain consistent icon usage across the app
- Icons should complement, not compete with text

### 7. Accessibility

- Ensure sufficient color contrast
- Provide clear labels for screen readers
- Make touch targets at least 44x44 points (iOS) or 48x48 dp (Android)
- Test with accessibility tools

### 8. Mobile Considerations

- Use full-width buttons for primary actions on mobile
- Ensure buttons are easily tappable
- Consider thumb-friendly placement
- Test on various screen sizes

## Design Tokens

The Button component uses the following design tokens from the system:

**Colors:**

- Primary: `colors.primary` (#007AFF)
- Text: `colors.white`, `colors.primary`, `colors.textTertiary`
- Background: `colors.primary`, `colors.white`, `transparent`

**Sizes:**

- Small: `sizes.button.sm` (32px)
- Medium: `sizes.button.md` (44px)
- Large: `sizes.button.lg` (52px)

**Spacing:**

- Horizontal padding varies by size
- Vertical padding varies by size
- Icon spacing: `spacing.xs` (4px)

**Typography:**

- Font family: `typography.fontFamily.regular`
- Font weight: `typography.fontWeight.medium`
- Font sizes: `typography.fontSize.sm/base/lg`

**Border Radius:**

- All buttons: `borderRadius.md` (12px)

## Troubleshooting

### Button not responding to presses

- Ensure `onPress` prop is provided
- Check if button is disabled or in loading state
- Verify no overlay is blocking the button
- Check for custom styles that might interfere

### Icons not displaying

- Verify icon name exists in Ionicons library
- Check icon name spelling (case-sensitive)
- Ensure `react-native-vector-icons` is properly linked
- For iOS, ensure fonts are included in Info.plist

### Styling issues

- Custom styles may override default styles
- Check for conflicting style props
- Verify design tokens are properly imported
- Use `textStyle` for text-specific styling

### Performance

- Avoid inline function definitions in `onPress`
- Use `useCallback` for handler functions
- Minimize re-renders by memoizing button props

## Related Components

- **BackButton**: Specialized button for navigation back actions
- **Badge**: Small status indicators
- **Input**: Form input components that often work with buttons

## References

- [Ant Design React Native](https://rn.mobile.ant.design/components/button)
- [Ionicons Documentation](https://ionic.io/ionicons)
- [React Native TouchableOpacity](https://reactnative.dev/docs/touchableopacity)
- [Design System Documentation](./STYLES_GUIDE.md)
