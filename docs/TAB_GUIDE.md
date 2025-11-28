# Tab Component Guide

## Overview

The `SegmentedControl` (Tab) component is a reusable, customizable segmented control that follows Ant Design principles and uses the system's design tokens. It provides a tab-like interface for switching between multiple options, commonly used for filtering, view switching, and navigation within a single view.

## Installation

The Tab component is part of the shared components library and can be imported as follows:

```typescript
import { SegmentedControl } from '@/shared/components';
```

## Props

| Prop             | Type                      | Default     | Required | Description                        |
| ---------------- | ------------------------- | ----------- | -------- | ---------------------------------- |
| `options`        | `string[]`                | -           | ✅ Yes   | Array of option labels             |
| `selectedIndex`  | `number`                  | -           | ✅ Yes   | Currently selected option index     |
| `onSelect`       | `(index: number) => void` | -           | ✅ Yes   | Callback when an option is selected |
| `disabled`       | `boolean`                 | `false`     | No       | Disable all tabs                   |
| `containerStyle` | `ViewStyle`               | -           | No       | Custom container styles             |
| `tabStyle`       | `ViewStyle`               | -           | No       | Custom tab styles                  |
| `textStyle`      | `ViewStyle`               | -           | No       | Custom text styles                 |

## Basic Usage

### Simple Two-Option Tab

```typescript
import { SegmentedControl } from '@/shared/components';
import { useState } from 'react';

function MyComponent() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <SegmentedControl
      options={['Login', 'Register']}
      selectedIndex={selectedIndex}
      onSelect={setSelectedIndex}
    />
  );
}
```

### Three-Option Tab

```typescript
function FilterTabs() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <SegmentedControl
      options={['All', 'Active', 'Completed']}
      selectedIndex={selectedIndex}
      onSelect={setSelectedIndex}
    />
  );
}
```

## Common Use Cases

### Authentication Tabs

Switch between login and registration forms.

```typescript
function AuthTabs() {
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
```

### Filter Tabs

Filter content by status or category.

```typescript
function ContentFilter() {
  const [filter, setFilter] = useState(0);

  const filteredData = useMemo(() => {
    switch (filter) {
      case 0:
        return allItems;
      case 1:
        return items.filter(item => item.status === 'active');
      case 2:
        return items.filter(item => item.status === 'completed');
      default:
        return allItems;
    }
  }, [filter, items]);

  return (
    <>
      <SegmentedControl
        options={['All', 'Active', 'Completed']}
        selectedIndex={filter}
        onSelect={setFilter}
      />
      <ItemList items={filteredData} />
    </>
  );
}
```

### View Mode Tabs

Switch between different view modes (list, grid, etc.).

```typescript
function ViewModeSelector() {
  const [viewMode, setViewMode] = useState(0);

  return (
    <>
      <SegmentedControl
        options={['List', 'Grid']}
        selectedIndex={viewMode}
        onSelect={setViewMode}
      />
      {viewMode === 0 ? <ListView /> : <GridView />}
    </>
  );
}
```

### Time Period Tabs

Select different time periods for data display.

```typescript
function TimePeriodSelector() {
  const [period, setPeriod] = useState(0);

  const periods = ['Day', 'Week', 'Month', 'Year'];

  return (
    <>
      <SegmentedControl
        options={periods}
        selectedIndex={period}
        onSelect={setPeriod}
      />
      <Chart data={getDataForPeriod(periods[period])} />
    </>
  );
}
```

### Input Method Tabs

Switch between different input methods (email, phone, etc.).

```typescript
function LoginMethodSelector() {
  const [method, setMethod] = useState(0);

  return (
    <>
      <SegmentedControl
        options={['Email', 'Phone']}
        selectedIndex={method}
        onSelect={setMethod}
      />
      {method === 0 ? (
        <Input
          label="Email"
          placeholder="example@email.com"
          keyboardType="email-address"
        />
      ) : (
        <Input
          label="Phone"
          placeholder="0123456789"
          keyboardType="phone-pad"
        />
      )}
    </>
  );
}
```

## States

### Default State

Tabs in their default state with unselected options.

```typescript
<SegmentedControl
  options={['Option 1', 'Option 2']}
  selectedIndex={0}
  onSelect={setSelectedIndex}
/>
```

**Visual Behavior:**

- Unselected tabs: Transparent background, gray text
- Selected tab: White background, blue border, blue text
- Smooth transitions between states

### Disabled State

Disable all tabs to prevent interaction.

```typescript
<SegmentedControl
  options={['Option 1', 'Option 2']}
  selectedIndex={0}
  onSelect={() => {}}
  disabled
/>
```

**Visual Behavior:**

- Reduced opacity (50%)
- No touch interaction
- Maintains visual hierarchy

## Styling

### Custom Container Styles

Apply custom styles to the container.

```typescript
<SegmentedControl
  options={['Tab 1', 'Tab 2']}
  selectedIndex={selectedIndex}
  onSelect={setSelectedIndex}
  containerStyle={{
    marginVertical: 20,
    backgroundColor: '#f0f0f0',
  }}
/>
```

### Custom Tab Styles

Apply custom styles to individual tabs.

```typescript
<SegmentedControl
  options={['Tab 1', 'Tab 2']}
  selectedIndex={selectedIndex}
  onSelect={setSelectedIndex}
  tabStyle={{
    minHeight: 50,
  }}
/>
```

### Custom Text Styles

Apply custom styles to tab text.

```typescript
<SegmentedControl
  options={['Tab 1', 'Tab 2']}
  selectedIndex={selectedIndex}
  onSelect={setSelectedIndex}
  textStyle={{
    fontSize: 16,
  }}
/>
```

## Examples

### Complete Form with Tabs

```typescript
function AuthScreen() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View>
      <SegmentedControl
        options={['Login', 'Register']}
        selectedIndex={selectedTab}
        onSelect={setSelectedTab}
      />
      
      {selectedTab === 0 ? (
        <>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Button title="Login" onPress={handleLogin} />
        </>
      ) : (
        <>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Input
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          <Button title="Register" onPress={handleRegister} />
        </>
      )}
    </View>
  );
}
```

### Dynamic Options

```typescript
function DynamicTabs() {
  const [options, setOptions] = useState(['Option 1', 'Option 2']);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const addOption = () => {
    setOptions([...options, `Option ${options.length + 1}`]);
  };

  return (
    <>
      <SegmentedControl
        options={options}
        selectedIndex={selectedIndex}
        onSelect={setSelectedIndex}
      />
      <Button title="Add Option" onPress={addOption} />
    </>
  );
}
```

### Controlled Tab with Validation

```typescript
function ValidatedTabs() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canChange, setCanChange] = useState(true);

  const handleSelect = (index: number) => {
    if (canChange) {
      setSelectedIndex(index);
    } else {
      // Show warning or prevent change
      Alert.alert('Warning', 'Please complete current form first');
    }
  };

  return (
    <SegmentedControl
      options={['Form 1', 'Form 2']}
      selectedIndex={selectedIndex}
      onSelect={handleSelect}
    />
  );
}
```

## Best Practices

### 1. Limit Number of Options

Keep the number of options reasonable (2-5 options) to maintain usability.

```typescript
// ✅ Good - 2-4 options
<SegmentedControl options={['Option 1', 'Option 2']} ... />
<SegmentedControl options={['Q1', 'Q2', 'Q3', 'Q4']} ... />

// ❌ Bad - Too many options
<SegmentedControl options={['Opt1', 'Opt2', 'Opt3', 'Opt4', 'Opt5', 'Opt6', 'Opt7']} ... />
```

### 2. Use Clear, Concise Labels

Labels should be short and descriptive.

```typescript
// ✅ Good
options={['Login', 'Register']}
options={['All', 'Active', 'Completed']}

// ❌ Bad
options={['Login to your account', 'Register a new account']}
options={['Show all items', 'Show only active items', 'Show only completed items']}
```

### 3. Maintain Consistent State

Always use controlled components with state management.

```typescript
// ✅ Good
const [selectedIndex, setSelectedIndex] = useState(0);
<SegmentedControl selectedIndex={selectedIndex} onSelect={setSelectedIndex} ... />

// ❌ Bad
<SegmentedControl selectedIndex={0} onSelect={(i) => console.log(i)} ... />
```

### 4. Provide Visual Feedback

Ensure selected state is clearly visible.

- Selected tab has distinct styling (white background, blue border)
- Text color changes to primary color
- Smooth transitions between states

### 5. Handle Edge Cases

- Ensure `selectedIndex` is within bounds
- Handle empty options array
- Validate index before setting state

```typescript
const handleSelect = (index: number) => {
  if (index >= 0 && index < options.length) {
    setSelectedIndex(index);
  }
};
```

### 6. Accessibility

- Ensure sufficient color contrast
- Make touch targets at least 44x44 points
- Provide clear labels
- Test with screen readers

### 7. Performance

- Avoid inline function definitions in `onSelect`
- Use `useCallback` for handler functions
- Minimize re-renders by memoizing props

### 8. Mobile Considerations

- Ensure tabs are easily tappable
- Consider thumb-friendly placement
- Test on various screen sizes
- Maintain adequate spacing between tabs

## Design Tokens

The Tab component uses the following design tokens from the system:

**Colors:**

- Container Background: `colors.backgroundSecondary` (#F9FAFB)
- Selected Tab Background: `colors.white` (#FFFFFF)
- Selected Tab Border: `colors.primary` (#007AFF)
- Selected Text: `colors.primary` (#007AFF)
- Unselected Text: `colors.textSecondary` (#6B7280)
- Disabled Text: `colors.textTertiary` (#9CA3AF)

**Sizes:**

- Tab Min Height: `sizes.button.sm` (32px)
- Tab Padding: `spacing.sm` vertical, `spacing.md` horizontal

**Spacing:**

- Container Padding: `spacing.xs` (4px)
- Tab Spacing: `spacing.xs / 2` (2px) between tabs

**Typography:**

- Font Size: `typography.fontSize.sm` (14px)
- Selected Font Weight: `typography.fontWeight.semibold` (600)
- Unselected Font Weight: `typography.fontWeight.medium` (500)
- Font Family: `typography.fontFamily.regular`

**Border Radius:**

- Container: `borderRadius.md` (12px)
- Tab: `borderRadius.sm` (8px)

## Troubleshooting

### Tab not responding to presses

- Ensure `onSelect` prop is provided
- Check if tabs are disabled
- Verify `selectedIndex` is properly managed
- Check for overlay blocking touches

### Selected state not updating

- Ensure state is properly managed
- Verify `selectedIndex` prop matches state
- Check for conflicting state updates
- Ensure controlled component pattern is used

### Tabs not displaying correctly

- Verify `options` array is not empty
- Check if custom styles are overriding defaults
- Ensure design tokens are properly imported
- Verify container has sufficient width

### Performance issues

- Avoid inline function definitions
- Use `useCallback` for handlers
- Minimize re-renders
- Check for unnecessary state updates

### Styling issues

- Custom styles may override default styles
- Check for conflicting style props
- Verify design tokens are properly imported
- Use `containerStyle`, `tabStyle`, and `textStyle` appropriately

## Related Components

- **Button**: Often used alongside tabs for actions
- **Input**: Commonly used with tabs for different input methods
- **Text**: Used for labels and descriptions

## References

- [Ant Design React Native Segmented Control](https://rn.mobile.ant.design/components/segmented-control)
- [React Native TouchableOpacity](https://reactnative.dev/docs/touchableopacity)
- [Design System Documentation](./STYLES_GUIDE.md)

