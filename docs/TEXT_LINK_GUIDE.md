# TextLink Component Guide

## Overview

The `TextLink` component is a reusable, customizable text link component that follows Ant Design principles and uses the system's design tokens. It supports simple links, text with links, and multiple links in a single line, providing flexible options for various use cases like "Forgot Password?", registration links, and terms/privacy policy links.

## Installation

The TextLink component is part of the shared components library and can be imported as follows:

```typescript
import { TextLink } from '@/shared/components';
```

## Props

| Prop          | Type                      | Default            | Required | Description                                    |
| ------------- | ------------------------- | ------------------ | -------- | ---------------------------------------------- |
| `linkText`    | `string`                  | -                  | No       | Simple link text (for simple link mode)        |
| `onPress`     | `() => void`              | -                  | No       | Callback when simple link is pressed           |
| `text`        | `string`                  | -                  | No       | Regular text before link                       |
| `textAfter`   | `string`                  | -                  | No       | Regular text after link                        |
| `links`       | `LinkItem[]`              | -                  | No       | Multiple links with text                       |
| `align`       | `'left' \| 'center' \| 'right'` | `'left'`    | No       | Alignment of the text                           |
| `linkColor`   | `string`                  | `colors.primary`   | No       | Link color                                      |
| `textColor`   | `string`                  | `colors.textSecondary` | No    | Text color                                      |
| `fontSize`    | `number`                  | `typography.fontSize.sm` | No    | Font size                                       |
| `containerStyle` | `ViewStyle`            | -                  | No       | Custom container styles                         |
| `textStyle`   | `TextStyle`               | -                  | No       | Custom text styles                              |
| `linkStyle`   | `TextStyle`               | -                  | No       | Custom link styles                              |

**LinkItem Interface:**

```typescript
interface LinkItem {
  text: string;      // Link text
  onPress: () => void; // Callback when link is pressed
}
```

## Usage Modes

### 1. Simple Link Mode

Display only a clickable link text, like "Forgot Password?".

```typescript
<TextLink
  linkText="Forgot Password?"
  onPress={handleForgotPassword}
/>
```

**Use cases:**
- Forgot password links
- "Learn More" links
- "View All" links
- Standalone action links

### 2. Text + Link Mode

Display regular text followed by a clickable link.

```typescript
<TextLink
  text="Don't have an account?"
  linkText="Sign up"
  onPress={handleSignUp}
/>
```

**With text after link:**

```typescript
<TextLink
  text="By continuing, you agree to our"
  linkText="Terms of Service"
  onPress={handleTerms}
  textAfter="and Privacy Policy"
/>
```

**Use cases:**
- Registration/login prompts
- Terms and conditions references
- Help text with action links

### 3. Multiple Links Mode

Display text with multiple clickable links, like terms and privacy policy.

```typescript
<TextLink
  text="Bằng việc đăng kí, bạn đã đồng ý với Mebione về"
  links={[
    { text: 'Điều khoản dịch vụ', onPress: handleTerms },
    { text: 'Chính sách bảo mật', onPress: handlePrivacy },
  ]}
/>
```

**Multiple links without prefix text:**

```typescript
<TextLink
  links={[
    { text: 'Terms', onPress: handleTerms },
    { text: 'Privacy', onPress: handlePrivacy },
    { text: 'Cookies', onPress: handleCookies },
  ]}
/>
```

**Use cases:**
- Terms of service and privacy policy
- Multiple related links
- Legal/compliance text

## Alignment

Control the horizontal alignment of the text link.

```typescript
// Left aligned (default)
<TextLink
  linkText="Forgot Password?"
  onPress={handleForgotPassword}
  align="left"
/>

// Center aligned
<TextLink
  linkText="Sign up"
  onPress={handleSignUp}
  align="center"
/>

// Right aligned
<TextLink
  linkText="Forgot Password?"
  onPress={handleForgotPassword}
  align="right"
/>
```

**Use cases:**
- **Left**: Default alignment, general use
- **Center**: Centered content, registration forms
- **Right**: Right-aligned actions, forgot password links

## Customization

### Custom Colors

Override default colors for links and text.

```typescript
<TextLink
  text="Custom colors:"
  linkText="Click here"
  onPress={handleClick}
  linkColor={colors.error}
  textColor={colors.text}
/>
```

### Custom Font Size

Adjust the font size for different contexts.

```typescript
<TextLink
  linkText="Large Link"
  onPress={handleClick}
  fontSize={18}
/>

<TextLink
  linkText="Small Link"
  onPress={handleClick}
  fontSize={12}
/>
```

### Custom Styles

Apply custom styles to container, text, or links.

```typescript
<TextLink
  linkText="Custom Styled"
  onPress={handleClick}
  containerStyle={{ marginTop: 20 }}
  textStyle={{ fontStyle: 'italic' }}
  linkStyle={{ textDecorationLine: 'underline' }}
/>
```

## Examples

### Login Form

```typescript
function LoginForm() {
  const handleForgotPassword = () => {
    // Navigate to forgot password screen
  };

  return (
    <>
      <Input label="Email" ... />
      <Input label="Password" ... />
      <TextLink
        linkText="Forgot Password?"
        onPress={handleForgotPassword}
        align="right"
      />
      <Button title="Login" onPress={handleLogin} />
    </>
  );
}
```

### Registration Form

```typescript
function RegistrationForm() {
  const handleSignUp = () => {
    // Navigate to sign up
  };

  const handleTerms = () => {
    // Open terms of service
  };

  const handlePrivacy = () => {
    // Open privacy policy
  };

  return (
    <>
      <Input label="Email" ... />
      <Input label="Password" ... />
      <Button title="Create Account" onPress={handleRegister} />
      
      <TextLink
        text="Bằng việc đăng kí, bạn đã đồng ý với Mebione về"
        links={[
          { text: 'Điều khoản dịch vụ', onPress: handleTerms },
          { text: 'Chính sách bảo mật', onPress: handlePrivacy },
        ]}
        align="center"
      />
      
      <TextLink
        text="Already have an account?"
        linkText="Sign in"
        onPress={handleSignUp}
        align="center"
      />
    </>
  );
}
```

### Terms and Privacy

```typescript
function TermsAndPrivacy() {
  return (
    <TextLink
      text="By continuing, you agree to our"
      links={[
        { text: 'Terms of Service', onPress: () => openTerms() },
        { text: 'Privacy Policy', onPress: () => openPrivacy() },
      ]}
      align="center"
    />
  );
}
```

### Multiple Action Links

```typescript
function FooterLinks() {
  return (
    <View>
      <TextLink
        links={[
          { text: 'Help', onPress: () => openHelp() },
          { text: 'Contact', onPress: () => openContact() },
          { text: 'About', onPress: () => openAbout() },
        ]}
        align="center"
      />
    </View>
  );
}
```

## Best Practices

### 1. Choose the Right Mode

- **Simple Link**: Use for standalone actions (Forgot Password, Learn More)
- **Text + Link**: Use for contextual prompts (Don't have account? Sign up)
- **Multiple Links**: Use for legal/compliance text (Terms and Privacy)

### 2. Use Appropriate Alignment

- **Left**: Default, general use
- **Center**: Forms, registration screens
- **Right**: Action links (Forgot Password)

### 3. Keep Link Text Clear

Use clear, action-oriented link text.

```typescript
// ✅ Good
linkText="Sign up"
linkText="Forgot Password?"
linkText="Learn More"

// ❌ Bad
linkText="Click here"
linkText="Link"
linkText="More info"
```

### 4. Provide Context

When using simple links, ensure the context is clear from surrounding content.

```typescript
// ✅ Good - Clear context
<Text>Having trouble logging in?</Text>
<TextLink linkText="Reset your password" onPress={handleReset} />

// ❌ Bad - Unclear context
<TextLink linkText="Click here" onPress={handleReset} />
```

### 5. Handle Navigation

Always provide proper navigation or action handlers.

```typescript
// ✅ Good
const handleSignUp = () => {
  navigation.navigate('Register');
};

<TextLink linkText="Sign up" onPress={handleSignUp} />

// ❌ Bad
<TextLink linkText="Sign up" onPress={() => {}} />
```

### 6. Accessibility

- Ensure sufficient color contrast
- Make touch targets at least 44x44 points
- Provide clear labels
- Test with screen readers

### 7. Consistency

Use consistent styling across the app.

- Same link color (primary)
- Same text color (textSecondary)
- Same font size (sm)
- Same alignment patterns

### 8. Mobile Considerations

- Ensure links are easily tappable
- Provide adequate spacing
- Test on various screen sizes
- Consider text wrapping for long content

## Design Tokens

The TextLink component uses the following design tokens from the system:

**Colors:**

- Link Color: `colors.primary` (#007AFF)
- Text Color: `colors.textSecondary` (#6B7280)
- Custom colors can be overridden via props

**Typography:**

- Font Size: `typography.fontSize.sm` (14px) - default
- Font Family: `typography.fontFamily.regular`
- Font Weight: `typography.fontWeight.regular`

**Spacing:**

- Container uses flexbox for spacing
- Text and links are spaced naturally

## Troubleshooting

### Link not responding to presses

- Ensure `onPress` prop is provided
- Check if link is within a scrollable view
- Verify no overlay is blocking touches
- Check for custom styles that might interfere

### Text not displaying correctly

- Verify text props are provided correctly
- Check for conflicting styles
- Ensure proper alignment settings
- Verify font size is appropriate

### Multiple links not working

- Ensure `links` array is not empty
- Verify each link has `text` and `onPress`
- Check for proper array structure
- Ensure links are properly mapped

### Alignment issues

- Verify `align` prop is set correctly
- Check container styles
- Ensure parent container allows alignment
- Check for conflicting flexbox styles

### Styling issues

- Custom styles may override default styles
- Check for conflicting style props
- Verify design tokens are properly imported
- Use `containerStyle`, `textStyle`, and `linkStyle` appropriately

## Related Components

- **Button**: Often used alongside TextLink for primary actions
- **Text**: Used for labels and descriptions
- **Input**: Commonly used with TextLink in forms

## References

- [React Native Text](https://reactnative.dev/docs/text)
- [React Native TouchableOpacity](https://reactnative.dev/docs/touchableopacity)
- [Design System Documentation](./STYLES_GUIDE.md)

