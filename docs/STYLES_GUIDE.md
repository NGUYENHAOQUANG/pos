# Hướng Dẫn Design System

## Tổng Quan Design System

### Philosophy

Design system của dự án được xây dựng dựa trên các nguyên tắc:

- **Nhất quán (Consistency)**: Sử dụng cùng một bộ tokens cho colors, spacing, typography trong toàn bộ ứng dụng
- **Có thể mở rộng (Scalable)**: Dễ dàng thêm mới hoặc điều chỉnh các giá trị mà không ảnh hưởng đến code hiện tại
- **Dễ sử dụng (Developer-friendly)**: API đơn giản, rõ ràng với TypeScript support đầy đủ
- **Cross-platform**: Hỗ trợ cả iOS và Android với các điều chỉnh phù hợp cho từng platform

### Cách Sử dụng

Tất cả style tokens được export từ `@/styles`:

```typescript
import { colors, spacing, typography, shadows, borderRadius, sizes } from '@/styles';
import { commonStyles, spacingStyles } from '@/styles';
import { layout } from '@/styles';
```

### Lợi ích

- ✅ UI nhất quán xuyên suốt ứng dụng
- ✅ Dễ dàng maintain và update theme
- ✅ TypeScript autocomplete và type safety
- ✅ Giảm thiểu magic numbers trong code
- ✅ Tăng tốc độ development với pre-built utilities

## Color System

### Primary Colors

Màu chính của ứng dụng, sử dụng cho các elements quan trọng như buttons, links, active states.

| Token | Hex | Use Case |
|-------|-----|----------|
| `colors.primary` | `#007AFF` | Primary buttons, links, active states |
| `colors.primaryDark` | `#0051D5` | Hover/pressed states |
| `colors.primaryLight` | `#5AC8FA` | Backgrounds, subtle highlights |

### Secondary Colors

Màu phụ để tạo sự đa dạng và phân biệt các elements.

| Token | Hex | Use Case |
|-------|-----|----------|
| `colors.secondary` | `#5856D6` | Secondary actions, accents |
| `colors.secondaryDark` | `#3634A3` | Hover/pressed states |
| `colors.secondaryLight` | `#AF52DE` | Backgrounds, badges |

### Neutral Colors

Bảng màu xám với 10 levels, sử dụng cho text, backgrounds, borders.

| Token | Hex | Use Case |
|-------|-----|----------|
| `colors.white` | `#FFFFFF` | White backgrounds, text on dark |
| `colors.black` | `#000000` | Pure black (use sparingly) |
| `colors.gray[50]` | `#F9FAFB` | Lightest gray, subtle backgrounds |
| `colors.gray[100]` | `#F3F4F6` | Light backgrounds, disabled states |
| `colors.gray[200]` | `#E5E7EB` | Borders, dividers |
| `colors.gray[300]` | `#D1D5DB` | Borders, inactive elements |
| `colors.gray[400]` | `#9CA3AF` | Placeholder text |
| `colors.gray[500]` | `#6B7280` | Secondary text |
| `colors.gray[600]` | `#4B5563` | Body text |
| `colors.gray[700]` | `#374151` | Headings |
| `colors.gray[800]` | `#1F2937` | Dark text |
| `colors.gray[900]` | `#111827` | Darkest text |

### Semantic Colors

Màu có ý nghĩa cụ thể cho các trạng thái và thông báo.

| Token | Hex | Use Case |
|-------|-----|----------|
| `colors.success` | `#34C759` | Success messages, positive actions |
| `colors.warning` | `#FF9500` | Warnings, caution states |
| `colors.error` | `#FF3B30` | Errors, destructive actions |
| `colors.info` | `#007AFF` | Information, neutral notifications |

### Background Colors

| Token | Hex | Use Case |
|-------|-----|----------|
| `colors.background` | `#FFFFFF` | Main background |
| `colors.backgroundSecondary` | `#F9FAFB` | Secondary backgrounds, cards |
| `colors.backgroundTertiary` | `#F3F4F6` | Tertiary backgrounds, inputs |

### Text Colors

| Token | Hex | Use Case |
|-------|-----|----------|
| `colors.text` | `#111827` | Primary text, headings |
| `colors.textSecondary` | `#6B7280` | Secondary text, descriptions |
| `colors.textTertiary` | `#9CA3AF` | Tertiary text, placeholders |
| `colors.textInverse` | `#FFFFFF` | Text on dark backgrounds |

### Border Colors

| Token | Hex | Use Case |
|-------|-----|----------|
| `colors.border` | `#E5E7EB` | Default borders |
| `colors.borderLight` | `#F3F4F6` | Light borders |
| `colors.borderDark` | `#D1D5DB` | Emphasized borders |

### Usage Examples

```typescript
import { StyleSheet } from 'react-native';
import { colors } from '@/styles';

const styles = StyleSheet.create({
  // Primary button
  primaryButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  // Card with border
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },

  // Success message
  successBanner: {
    backgroundColor: colors.success,
  },

  // Text hierarchy
  heading: {
    color: colors.text,
  },
  description: {
    color: colors.textSecondary,
  },
  placeholder: {
    color: colors.textTertiary,
  },
});
```

## Typography System

### Font Families

Font families được tối ưu cho từng platform:

| Token | iOS | Android | Use Case |
|-------|-----|---------|----------|
| `typography.fontFamily.regular` | System | sans-serif | Body text, regular weight |
| `typography.fontFamily.medium` | System | sans-serif-medium | Medium weight text |
| `typography.fontFamily.bold` | System | sans-serif | Bold text (use with fontWeight) |
| `typography.fontFamily.light` | System | sans-serif-light | Light weight text |

**Lưu ý**: Trên iOS, sử dụng `fontWeight` để điều chỉnh độ đậm. Trên Android, font family đã bao gồm weight.

### Font Sizes

Scale từ nhỏ đến lớn với tỷ lệ hợp lý:

| Token | Size (px) | Use Case |
|-------|-----------|----------|
| `typography.fontSize.xs` | 12 | Captions, labels, timestamps |
| `typography.fontSize.sm` | 14 | Small text, secondary info |
| `typography.fontSize.base` | 16 | Body text, default size |
| `typography.fontSize.lg` | 18 | Emphasized text, subtitles |
| `typography.fontSize.xl` | 20 | Small headings, card titles |
| `typography.fontSize['2xl']` | 24 | Section headings |
| `typography.fontSize['3xl']` | 30 | Page headings |
| `typography.fontSize['4xl']` | 36 | Large headings |
| `typography.fontSize['5xl']` | 48 | Hero text, splash screens |

### Font Weights

| Token | Value | Use Case |
|-------|-------|----------|
| `typography.fontWeight.light` | '300' | Light text, subtle emphasis |
| `typography.fontWeight.regular` | '400' | Body text, default weight |
| `typography.fontWeight.medium` | '500' | Slightly emphasized text |
| `typography.fontWeight.semibold` | '600' | Subheadings, important text |
| `typography.fontWeight.bold` | '700' | Headings, strong emphasis |

### Line Heights

| Token | Value | Use Case |
|-------|-------|----------|
| `typography.lineHeight.tight` | 1.2 | Headings, compact text |
| `typography.lineHeight.normal` | 1.5 | Body text, default |
| `typography.lineHeight.relaxed` | 1.75 | Long-form content, readability |

### Typography Combinations

Các combinations phổ biến:

```typescript
import { StyleSheet } from 'react-native';
import { typography, colors } from '@/styles';

const styles = StyleSheet.create({
  // Heading 1
  h1: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.fontSize['3xl'] * typography.lineHeight.tight,
    color: colors.text,
  },

  // Heading 2
  h2: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.fontSize['2xl'] * typography.lineHeight.tight,
    color: colors.text,
  },

  // Heading 3
  h3: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.fontSize.xl * typography.lineHeight.tight,
    color: colors.text,
  },

  // Body text
  body: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
    color: colors.text,
  },

  // Small text
  small: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
    color: colors.textSecondary,
  },

  // Caption
  caption: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.fontSize.xs * typography.lineHeight.normal,
    color: colors.textTertiary,
  },
});
```

### Accessibility Considerations

- Sử dụng minimum font size 12px cho readability
- Line height tối thiểu 1.5 cho body text
- Đảm bảo contrast ratio đủ giữa text và background (WCAG AA: 4.5:1)
- Hỗ trợ dynamic type scaling trên iOS

## Spacing System

### Spacing Scale

Scale 8-point grid system cho consistency:

| Token | Size (px) | Use Case |
|-------|-----------|----------|
| `spacing.xs` | 4 | Minimal spacing, tight layouts |
| `spacing.sm` | 8 | Small gaps, compact elements |
| `spacing.md` | 16 | Default spacing, standard gaps |
| `spacing.lg` | 24 | Section spacing, card padding |
| `spacing.xl` | 32 | Large gaps, screen padding |
| `spacing['2xl']` | 48 | Extra large spacing, major sections |
| `spacing['3xl']` | 64 | Maximum spacing, hero sections |

### Usage Guidelines

**Khi nào dùng spacing nào:**

- **xs (4px)**: Icon padding, badge spacing, minimal gaps
- **sm (8px)**: Button padding, input padding, list item gaps
- **md (16px)**: Card padding, screen horizontal padding, default gaps
- **lg (24px)**: Section spacing, card vertical padding
- **xl (32px)**: Screen vertical padding, major section gaps
- **2xl (48px)**: Empty state spacing, hero section padding
- **3xl (64px)**: Maximum spacing for special layouts

### Spacing Utilities

Sử dụng `spacingStyles` để apply spacing nhanh chóng:

```typescript
import { spacingStyles } from '@/styles';

// Margin utilities
spacingStyles.mt.md    // marginTop: 16
spacingStyles.mb.lg    // marginBottom: 24
spacingStyles.mx.sm    // marginHorizontal: 8
spacingStyles.my.xl    // marginVertical: 32

// Padding utilities
spacingStyles.p.md     // padding: 16
spacingStyles.px.lg    // paddingHorizontal: 24
spacingStyles.py.sm    // paddingVertical: 8
```

### Examples

```typescript
import { StyleSheet, View, Text } from 'react-native';
import { spacing, spacingStyles } from '@/styles';

// Method 1: Direct values
const styles1 = StyleSheet.create({
  container: {
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
});

// Method 2: Using utilities
function MyComponent() {
  return (
    <View style={[styles.card, spacingStyles.p.lg, spacingStyles.mb.md]}>
      <Text>Content</Text>
    </View>
  );
}

// Method 3: Common patterns
const styles2 = StyleSheet.create({
  // Screen padding
  screen: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xl,
  },

  // Card spacing
  card: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },

  // List item
  listItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },

  // Section
  section: {
    marginBottom: spacing.lg,
  },
});
```

### Layout Patterns

```typescript
// Vertical stack with consistent spacing
<View>
  <View style={spacingStyles.mb.md}>
    <Text>Item 1</Text>
  </View>
  <View style={spacingStyles.mb.md}>
    <Text>Item 2</Text>
  </View>
  <View>
    <Text>Item 3</Text>
  </View>
</View>

// Horizontal row with gaps
<View style={[layout.row, { gap: spacing.sm }]}>
  <Text>Left</Text>
  <Text>Right</Text>
</View>
```

## Shadows & Elevation

### Shadow Levels

Shadows tạo depth và hierarchy cho UI elements. React Native sử dụng cách khác nhau cho iOS và Android:

- **iOS**: `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`
- **Android**: `elevation`

| Token | iOS Shadow | Android Elevation | Use Case |
|-------|------------|-------------------|----------|
| `shadows.none` | No shadow | 0 | Flat elements |
| `shadows.sm` | offset: (0, 1), opacity: 0.1, radius: 2 | 2 | Subtle depth, cards |
| `shadows.md` | offset: (0, 2), opacity: 0.1, radius: 4 | 3 | Standard cards, buttons |
| `shadows.lg` | offset: (0, 4), opacity: 0.1, radius: 8 | 5 | Elevated cards, modals |
| `shadows.xl` | offset: (0, 8), opacity: 0.15, radius: 12 | 8 | Floating elements, dropdowns |

### Platform Differences

**iOS:**
- Shadows render outside the element bounds
- Requires `overflow: 'visible'` on parent
- Performance impact với nhiều shadows

**Android:**
- Elevation creates shadow automatically
- Shadow color luôn là black
- Better performance than iOS shadows

### Usage Examples

```typescript
import { StyleSheet } from 'react-native';
import { shadows, colors, borderRadius } from '@/styles';

const styles = StyleSheet.create({
  // Card with subtle shadow
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },

  // Elevated card
  elevatedCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },

  // Floating button
  floatingButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    ...shadows.lg,
  },

  // Modal/Dropdown
  modal: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    ...shadows.xl,
  },
});
```

### Best Practices

- ✅ Sử dụng shadows để tạo visual hierarchy
- ✅ Consistent shadow levels cho cùng loại elements
- ✅ Combine với borderRadius để tạo modern look
- ❌ Tránh quá nhiều shadows trên một screen
- ❌ Không stack nhiều shadows lên nhau
- ❌ Tránh shadows trên transparent backgrounds

### Performance Tips

```typescript
// ❌ Bad: Nhiều shadows trong FlatList
<FlatList
  data={items}
  renderItem={({item}) => (
    <View style={[styles.item, shadows.md]}>
      {/* content */}
    </View>
  )}
/>

// ✅ Good: Sử dụng border thay vì shadow cho list items
<FlatList
  data={items}
  renderItem={({item}) => (
    <View style={styles.item}>
      {/* content */}
    </View>
  )}
/>

const styles = StyleSheet.create({
  item: {
    borderWidth: 1,
    borderColor: colors.border,
    // Faster than shadows
  },
});
```

## Border Radius

### Border Radius Scale

| Token | Size (px) | Use Case |
|-------|-----------|----------|
| `borderRadius.none` | 0 | Sharp corners, no rounding |
| `borderRadius.xs` | 4 | Subtle rounding, badges |
| `borderRadius.sm` | 8 | Buttons, inputs, small cards |
| `borderRadius.md` | 12 | Standard cards, containers |
| `borderRadius.lg` | 16 | Large cards, modals |
| `borderRadius.xl` | 20 | Extra large containers |
| `borderRadius['2xl']` | 24 | Hero sections, special cards |
| `borderRadius['3xl']` | 32 | Maximum rounding |
| `borderRadius.full` | 9999 | Circles, pills, rounded buttons |

### Use Cases

**Buttons:**
```typescript
// Rounded button
button: {
  borderRadius: borderRadius.sm,  // 8px
}

// Pill button
pillButton: {
  borderRadius: borderRadius.full,  // Fully rounded
}
```

**Cards:**
```typescript
// Standard card
card: {
  borderRadius: borderRadius.md,  // 12px
}

// Large card
largeCard: {
  borderRadius: borderRadius.lg,  // 16px
}
```

**Inputs:**
```typescript
// Input field
input: {
  borderRadius: borderRadius.sm,  // 8px
}
```

**Avatars & Icons:**
```typescript
// Circle avatar
avatar: {
  borderRadius: borderRadius.full,  // Perfect circle
}

// Rounded square icon
iconContainer: {
  borderRadius: borderRadius.md,  // 12px
}
```

**Badges:**
```typescript
// Small badge
badge: {
  borderRadius: borderRadius.xs,  // 4px
}

// Pill badge
pillBadge: {
  borderRadius: borderRadius.full,  // Fully rounded
}
```

### Examples

```typescript
import { StyleSheet } from 'react-native';
import { borderRadius, colors, spacing } from '@/styles';

const styles = StyleSheet.create({
  // Button variants
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },

  pillButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
  },

  // Card variants
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
  },

  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius['2xl'],
    padding: spacing['2xl'],
  },

  // Avatar
  avatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[200],
  },

  // Badge
  badge: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
});
```

### Combining with Other Styles

```typescript
// Card with shadow and border radius
const card = {
  backgroundColor: colors.white,
  borderRadius: borderRadius.md,
  padding: spacing.lg,
  ...shadows.sm,
};

// Image with rounded corners
const image = {
  width: 100,
  height: 100,
  borderRadius: borderRadius.lg,
};
```

## Sizes

### Icon Sizes

| Token | Size (px) | Use Case |
|-------|-----------|----------|
| `sizes.icon.xs` | 16 | Small icons, inline icons |
| `sizes.icon.sm` | 20 | Standard icons in buttons |
| `sizes.icon.md` | 24 | Default icon size |
| `sizes.icon.lg` | 32 | Large icons, feature icons |
| `sizes.icon.xl` | 36 | Extra large icons |
| `sizes.icon['2xl']` | 48 | Hero icons, empty states |

### Button Heights

| Token | Size (px) | Use Case |
|-------|-----------|----------|
| `sizes.button.sm` | 32 | Small buttons, compact UI |
| `sizes.button.md` | 44 | Standard buttons (iOS touch target) |
| `sizes.button.lg` | 52 | Large buttons, primary actions |
| `sizes.button.xl` | 60 | Extra large buttons, hero CTAs |

### Input Heights

| Token | Size (px) | Use Case |
|-------|-----------|----------|
| `sizes.input.sm` | 36 | Compact inputs, filters |
| `sizes.input.md` | 44 | Standard inputs (iOS touch target) |
| `sizes.input.lg` | 52 | Large inputs, search bars |

### Avatar Sizes

| Token | Size (px) | Use Case |
|-------|-----------|----------|
| `sizes.avatar.xs` | 24 | Tiny avatars, inline mentions |
| `sizes.avatar.sm` | 32 | Small avatars, list items |
| `sizes.avatar.md` | 40 | Standard avatars |
| `sizes.avatar.lg` | 56 | Large avatars, profiles |
| `sizes.avatar.xl` | 80 | Extra large avatars |
| `sizes.avatar['2xl']` | 120 | Hero avatars, profile headers |

### Badge Sizes

| Token | Size (px) | Use Case |
|-------|-----------|----------|
| `sizes.badge.sm` | 16 | Small notification badges |
| `sizes.badge.md` | 20 | Standard badges |
| `sizes.badge.lg` | 24 | Large badges |

### Header Heights

| Token | Size (px) | Use Case |
|-------|-----------|----------|
| `sizes.header.default` | 56 | Standard header height |
| `sizes.header.large` | 72 | Large header with search |

### Tab Bar Heights

| Token | iOS | Android | Use Case |
|-------|-----|---------|----------|
| `sizes.tabBar.ios` | 88 | - | iOS tab bar (includes safe area) |
| `sizes.tabBar.android` | - | 60 | Android tab bar |

### Page Indicator

| Token | Size (px) | Use Case |
|-------|-----------|----------|
| `sizes.indicator` | 8 | Dot size for page indicators |

### Usage Examples

```typescript
import { StyleSheet } from 'react-native';
import { sizes, colors, borderRadius, spacing } from '@/styles';

const styles = StyleSheet.create({
  // Buttons
  smallButton: {
    height: sizes.button.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
  },

  standardButton: {
    height: sizes.button.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.sm,
  },

  largeButton: {
    height: sizes.button.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
  },

  // Inputs
  input: {
    height: sizes.input.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },

  // Avatars
  avatar: {
    width: sizes.avatar.md,
    height: sizes.avatar.md,
    borderRadius: borderRadius.full,
  },

  largeAvatar: {
    width: sizes.avatar.xl,
    height: sizes.avatar.xl,
    borderRadius: borderRadius.full,
  },

  // Icons
  icon: {
    width: sizes.icon.md,
    height: sizes.icon.md,
  },

  // Badge
  badge: {
    width: sizes.badge.md,
    height: sizes.badge.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.error,
  },

  // Header
  header: {
    height: sizes.header.default,
    paddingHorizontal: spacing.lg,
  },
});
```

### Touch Target Guidelines

**iOS Human Interface Guidelines**: Minimum 44x44 points
**Android Material Design**: Minimum 48x48 dp

```typescript
// ✅ Good: Meets minimum touch target
const button = {
  height: sizes.button.md,  // 44px
  minWidth: sizes.button.md,  // 44px
};

// ❌ Bad: Too small for comfortable touch
const tinyButton = {
  height: 32,
  width: 32,
};
```

## Common Styles

### Pre-built Style Combinations

`commonStyles` cung cấp các style combinations thường dùng để tăng tốc development.

### Container Styles

```typescript
import { commonStyles } from '@/styles';

// Basic container
<View style={commonStyles.container}>
  {/* flex: 1, backgroundColor: white */}
</View>

// Container with padding
<View style={commonStyles.containerPadded}>
  {/* flex: 1, backgroundColor: white, paddingHorizontal: 16 */}
</View>
```

### Card Styles

```typescript
// Standard card
<View style={commonStyles.card}>
  {/* white background, rounded corners, padding, subtle shadow */}
</View>

// Large card
<View style={commonStyles.cardLarge}>
  {/* white background, larger radius, more padding, medium shadow */}
</View>
```

### Header Styles

```typescript
// Header container
<View style={commonStyles.header}>
  <Text style={commonStyles.headerTitle}>Title</Text>
</View>
```

### Section Styles

```typescript
// Section container
<View style={commonStyles.section}>
  <Text style={commonStyles.sectionTitle}>Section Title</Text>
  {/* content */}
</View>
```

### Empty State Styles

```typescript
<View style={commonStyles.emptyState}>
  <View style={commonStyles.emptyIconContainer}>
    {/* icon */}
  </View>
  <Text style={commonStyles.emptyTitle}>No Items</Text>
  <Text style={commonStyles.emptyDescription}>
    Description text here
  </Text>
</View>
```

### Divider Styles

```typescript
// Horizontal divider
<View style={commonStyles.divider} />

// Vertical divider
<View style={commonStyles.dividerVertical} />
```

### Row Layouts

```typescript
// Basic row
<View style={commonStyles.row}>
  {/* flexDirection: row, alignItems: center */}
</View>

// Row with space between
<View style={commonStyles.rowBetween}>
  {/* flexDirection: row, alignItems: center, justifyContent: space-between */}
</View>

// Centered row
<View style={commonStyles.rowCenter}>
  {/* flexDirection: row, alignItems: center, justifyContent: center */}
</View>
```

### Text Utilities

```typescript
// Centered text
<Text style={commonStyles.textCenter}>Centered</Text>

// Bold text
<Text style={commonStyles.textBold}>Bold</Text>

// Semibold text
<Text style={commonStyles.textSemibold}>Semibold</Text>

// Medium text
<Text style={commonStyles.textMedium}>Medium</Text>
```

### Complete Examples

```typescript
import { View, Text, ScrollView } from 'react-native';
import { commonStyles, spacingStyles } from '@/styles';

// Screen with cards
function MyScreen() {
  return (
    <ScrollView style={commonStyles.containerPadded}>
      {/* Header */}
      <View style={[commonStyles.rowBetween, spacingStyles.mb.lg]}>
        <Text style={commonStyles.headerTitle}>Dashboard</Text>
      </View>

      {/* Section */}
      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>Recent Items</Text>

        {/* Cards */}
        <View style={[commonStyles.card, spacingStyles.mb.md]}>
          <Text>Card 1</Text>
        </View>

        <View style={[commonStyles.card, spacingStyles.mb.md]}>
          <Text>Card 2</Text>
        </View>
      </View>

      {/* Empty state */}
      <View style={commonStyles.emptyState}>
        <View style={commonStyles.emptyIconContainer}>
          {/* Icon component */}
        </View>
        <Text style={commonStyles.emptyTitle}>No Data</Text>
        <Text style={commonStyles.emptyDescription}>
          There are no items to display at this time.
        </Text>
      </View>
    </ScrollView>
  );
}
```

### Combining Styles

```typescript
// Combine multiple common styles
<View style={[
  commonStyles.card,
  spacingStyles.mb.lg,
  spacingStyles.p.xl,
]}>
  <View style={commonStyles.rowBetween}>
    <Text style={commonStyles.textBold}>Title</Text>
    <Text style={commonStyles.textSecondary}>Action</Text>
  </View>
  <View style={commonStyles.divider} />
  <Text>Content</Text>
</View>
```

## Layout Utilities

### Flex Utilities

```typescript
import { layout } from '@/styles';

// Flex 1
<View style={layout.flex.flex1}>
  {/* flex: 1 */}
</View>

// Flex row
<View style={layout.flex.flexRow}>
  {/* flexDirection: 'row' */}
</View>

// Flex column
<View style={layout.flex.flexColumn}>
  {/* flexDirection: 'column' */}
</View>
```

### Alignment Utilities

```typescript
// Align items center
<View style={layout.align.center}>
  {/* alignItems: 'center' */}
</View>

// Align items start
<View style={layout.align.start}>
  {/* alignItems: 'flex-start' */}
</View>

// Align items end
<View style={layout.align.end}>
  {/* alignItems: 'flex-end' */}
</View>

// Align items stretch
<View style={layout.align.stretch}>
  {/* alignItems: 'stretch' */}
</View>
```

### Justify Content Utilities

```typescript
// Justify center
<View style={layout.justify.center}>
  {/* justifyContent: 'center' */}
</View>

// Justify start
<View style={layout.justify.start}>
  {/* justifyContent: 'flex-start' */}
</View>

// Justify end
<View style={layout.justify.end}>
  {/* justifyContent: 'flex-end' */}
</View>

// Justify space between
<View style={layout.justify.between}>
  {/* justifyContent: 'space-between' */}
</View>

// Justify space around
<View style={layout.justify.around}>
  {/* justifyContent: 'space-around' */}
</View>

// Justify space evenly
<View style={layout.justify.evenly}>
  {/* justifyContent: 'space-evenly' */}
</View>
```

### Common Layout Combinations

```typescript
// Centered content
<View style={layout.centered}>
  {/* alignItems: 'center', justifyContent: 'center' */}
</View>

// Row layout
<View style={layout.row}>
  {/* flexDirection: 'row', alignItems: 'center' */}
</View>

// Row with space between
<View style={layout.rowBetween}>
  {/* flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' */}
</View>
```

### Layout Examples

```typescript
import { View, Text } from 'react-native';
import { layout, spacing } from '@/styles';

// Centered screen
function CenteredScreen() {
  return (
    <View style={[layout.flex.flex1, layout.centered]}>
      <Text>Centered Content</Text>
    </View>
  );
}

// Header with left and right items
function Header() {
  return (
    <View style={[layout.rowBetween, { padding: spacing.lg }]}>
      <Text>Left</Text>
      <Text>Title</Text>
      <Text>Right</Text>
    </View>
  );
}

// Vertical stack
function VerticalStack() {
  return (
    <View style={[layout.flex.flexColumn, { gap: spacing.md }]}>
      <Text>Item 1</Text>
      <Text>Item 2</Text>
      <Text>Item 3</Text>
    </View>
  );
}

// Horizontal row with icons
function IconRow() {
  return (
    <View style={[layout.row, { gap: spacing.sm }]}>
      {/* Icons */}
    </View>
  );
}

// Grid-like layout
function GridLayout() {
  return (
    <View style={layout.flex.flexRow}>
      <View style={[layout.flex.flex1, layout.align.center]}>
        <Text>Column 1</Text>
      </View>
      <View style={[layout.flex.flex1, layout.align.center]}>
        <Text>Column 2</Text>
      </View>
    </View>
  );
}
```

### Combining Layout Utilities

```typescript
// Complex layout
<View style={[
  layout.flex.flex1,
  layout.flex.flexColumn,
]}>
  {/* Header */}
  <View style={[layout.rowBetween, spacingStyles.p.lg]}>
    <Text>Header</Text>
  </View>

  {/* Content */}
  <View style={[layout.flex.flex1, layout.centered]}>
    <Text>Main Content</Text>
  </View>

  {/* Footer */}
  <View style={[layout.row, layout.justify.center, spacingStyles.p.md]}>
    <Text>Footer</Text>
  </View>
</View>
```

### Gap Property (React Native 0.71+)

```typescript
// Modern gap property for spacing
<View style={[layout.row, { gap: spacing.md }]}>
  <Text>Item 1</Text>
  <Text>Item 2</Text>
  <Text>Item 3</Text>
</View>

// Column gap
<View style={[layout.flex.flexColumn, { gap: spacing.lg }]}>
  <View>Section 1</View>
  <View>Section 2</View>
</View>
```

## Usage Examples

### Example 1: Building a Profile Card

```typescript
import { View, Text, Image, TouchableOpacity } from 'react-native';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  sizes,
  commonStyles,
  spacingStyles,
  layout,
} from '@/styles';

function ProfileCard({ user }) {
  return (
    <View style={[
      commonStyles.card,
      spacingStyles.mb.lg,
    ]}>
      {/* Header with avatar and name */}
      <View style={[layout.row, spacingStyles.mb.md]}>
        <Image
          source={{ uri: user.avatar }}
          style={{
            width: sizes.avatar.lg,
            height: sizes.avatar.lg,
            borderRadius: borderRadius.full,
            marginRight: spacing.md,
          }}
        />
        <View style={layout.flex.flex1}>
          <Text style={{
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text,
            marginBottom: spacing.xs,
          }}>
            {user.name}
          </Text>
          <Text style={{
            fontSize: typography.fontSize.sm,
            color: colors.textSecondary,
          }}>
            {user.email}
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View style={commonStyles.divider} />

      {/* Stats */}
      <View style={[
        layout.rowBetween,
        spacingStyles.mt.md,
        spacingStyles.mb.md,
      ]}>
        <View style={layout.align.center}>
          <Text style={{
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.text,
          }}>
            {user.posts}
          </Text>
          <Text style={{
            fontSize: typography.fontSize.sm,
            color: colors.textSecondary,
          }}>
            Posts
          </Text>
        </View>

        <View style={layout.align.center}>
          <Text style={{
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.text,
          }}>
            {user.followers}
          </Text>
          <Text style={{
            fontSize: typography.fontSize.sm,
            color: colors.textSecondary,
          }}>
            Followers
          </Text>
        </View>

        <View style={layout.align.center}>
          <Text style={{
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.text,
          }}>
            {user.following}
          </Text>
          <Text style={{
            fontSize: typography.fontSize.sm,
            color: colors.textSecondary,
          }}>
            Following
          </Text>
        </View>
      </View>

      {/* Action button */}
      <TouchableOpacity
        style={{
          backgroundColor: colors.primary,
          height: sizes.button.md,
          borderRadius: borderRadius.sm,
          ...layout.centered,
        }}
      >
        <Text style={{
          fontSize: typography.fontSize.base,
          fontWeight: typography.fontWeight.semibold,
          color: colors.white,
        }}>
          Follow
        </Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Example 2: Form Layout

```typescript
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  sizes,
  commonStyles,
  spacingStyles,
} from '@/styles';

function LoginForm() {
  return (
    <View style={[commonStyles.containerPadded, spacingStyles.py.xl]}>
      {/* Title */}
      <Text style={{
        fontSize: typography.fontSize['3xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.text,
        marginBottom: spacing.sm,
      }}>
        Welcome Back
      </Text>

      <Text style={{
        fontSize: typography.fontSize.base,
        color: colors.textSecondary,
        marginBottom: spacing['2xl'],
      }}>
        Sign in to continue
      </Text>

      {/* Email input */}
      <View style={spacingStyles.mb.lg}>
        <Text style={{
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.medium,
          color: colors.text,
          marginBottom: spacing.sm,
        }}>
          Email
        </Text>
        <TextInput
          placeholder="Enter your email"
          placeholderTextColor={colors.textTertiary}
          style={{
            height: sizes.input.md,
            paddingHorizontal: spacing.md,
            borderRadius: borderRadius.sm,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.white,
            fontSize: typography.fontSize.base,
            color: colors.text,
          }}
        />
      </View>

      {/* Password input */}
      <View style={spacingStyles.mb.lg}>
        <Text style={{
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.medium,
          color: colors.text,
          marginBottom: spacing.sm,
        }}>
          Password
        </Text>
        <TextInput
          placeholder="Enter your password"
          placeholderTextColor={colors.textTertiary}
          secureTextEntry
          style={{
            height: sizes.input.md,
            paddingHorizontal: spacing.md,
            borderRadius: borderRadius.sm,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.white,
            fontSize: typography.fontSize.base,
            color: colors.text,
          }}
        />
      </View>

      {/* Submit button */}
      <TouchableOpacity
        style={{
          backgroundColor: colors.primary,
          height: sizes.button.lg,
          borderRadius: borderRadius.sm,
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: spacing.xl,
        }}
      >
        <Text style={{
          fontSize: typography.fontSize.base,
          fontWeight: typography.fontWeight.semibold,
          color: colors.white,
        }}>
          Sign In
        </Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Example 3: List Item with Actions

```typescript
import { View, Text, TouchableOpacity } from 'react-native';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  sizes,
  layout,
  spacingStyles,
} from '@/styles';

function ListItem({ item, onEdit, onDelete }) {
  return (
    <View style={[
      layout.rowBetween,
      {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
      },
    ]}>
      {/* Left content */}
      <View style={layout.flex.flex1}>
        <Text style={{
          fontSize: typography.fontSize.base,
          fontWeight: typography.fontWeight.semibold,
          color: colors.text,
          marginBottom: spacing.xs,
        }}>
          {item.title}
        </Text>
        <Text style={{
          fontSize: typography.fontSize.sm,
          color: colors.textSecondary,
        }}>
          {item.description}
        </Text>
      </View>

      {/* Right actions */}
      <View style={[layout.row, { gap: spacing.sm }]}>
        <TouchableOpacity
          onPress={onEdit}
          style={{
            width: sizes.button.sm,
            height: sizes.button.sm,
            borderRadius: borderRadius.sm,
            backgroundColor: colors.primary,
            ...layout.centered,
          }}
        >
          <Text style={{ color: colors.white }}>✏️</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onDelete}
          style={{
            width: sizes.button.sm,
            height: sizes.button.sm,
            borderRadius: borderRadius.sm,
            backgroundColor: colors.error,
            ...layout.centered,
          }}
        >
          <Text style={{ color: colors.white }}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
```

### Example 4: Status Badge

```typescript
import { View, Text } from 'react-native';
import {
  colors,
  spacing,
  typography,
  borderRadius,
} from '@/styles';

function StatusBadge({ status }) {
  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'error':
        return colors.error;
      default:
        return colors.info;
    }
  };

  return (
    <View style={{
      backgroundColor: getStatusColor(),
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
    }}>
      <Text style={{
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
        color: colors.white,
      }}>
        {status.toUpperCase()}
      </Text>
    </View>
  );
}
```

### Example 5: Empty State

```typescript
import { View, Text, TouchableOpacity } from 'react-native';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  sizes,
  commonStyles,
  layout,
} from '@/styles';

function EmptyState({ title, description, actionText, onAction }) {
  return (
    <View style={commonStyles.emptyState}>
      {/* Icon container */}
      <View style={commonStyles.emptyIconContainer}>
        <Text style={{ fontSize: sizes.icon['2xl'] }}>📭</Text>
      </View>

      {/* Title */}
      <Text style={commonStyles.emptyTitle}>
        {title}
      </Text>

      {/* Description */}
      <Text style={commonStyles.emptyDescription}>
        {description}
      </Text>

      {/* Action button */}
      {actionText && onAction && (
        <TouchableOpacity
          onPress={onAction}
          style={{
            backgroundColor: colors.primary,
            height: sizes.button.md,
            paddingHorizontal: spacing.xl,
            borderRadius: borderRadius.sm,
            marginTop: spacing.lg,
            ...layout.centered,
          }}
        >
          <Text style={{
            fontSize: typography.fontSize.base,
            fontWeight: typography.fontWeight.semibold,
            color: colors.white,
          }}>
            {actionText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
```

### Example 6: Modal/Dialog

```typescript
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  sizes,
  layout,
  spacingStyles,
} from '@/styles';

function ConfirmDialog({ visible, title, message, onConfirm, onCancel }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={[
        layout.flex.flex1,
        layout.centered,
        { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
      ]}>
        <View style={{
          backgroundColor: colors.white,
          borderRadius: borderRadius.xl,
          padding: spacing.xl,
          marginHorizontal: spacing.lg,
          width: '80%',
          maxWidth: 400,
          ...shadows.xl,
        }}>
          {/* Title */}
          <Text style={{
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.bold,
            color: colors.text,
            marginBottom: spacing.md,
          }}>
            {title}
          </Text>

          {/* Message */}
          <Text style={{
            fontSize: typography.fontSize.base,
            color: colors.textSecondary,
            lineHeight: typography.fontSize.base * typography.lineHeight.normal,
            marginBottom: spacing.xl,
          }}>
            {message}
          </Text>

          {/* Actions */}
          <View style={[layout.row, { gap: spacing.md }]}>
            <TouchableOpacity
              onPress={onCancel}
              style={[
                layout.flex.flex1,
                {
                  height: sizes.button.md,
                  borderRadius: borderRadius.sm,
                  borderWidth: 1,
                  borderColor: colors.border,
                  ...layout.centered,
                },
              ]}
            >
              <Text style={{
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text,
              }}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              style={[
                layout.flex.flex1,
                {
                  height: sizes.button.md,
                  borderRadius: borderRadius.sm,
                  backgroundColor: colors.primary,
                  ...layout.centered,
                },
              ]}
            >
              <Text style={{
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.semibold,
                color: colors.white,
              }}>
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
```

## Best Practices

### Do's ✅

- **Sử dụng design tokens thay vì hardcoded values**
  ```typescript
  // ✅ Good
  backgroundColor: colors.primary
  padding: spacing.md

  // ❌ Bad
  backgroundColor: '#007AFF'
  padding: 16
  ```

- **Combine utilities để tái sử dụng**
  ```typescript
  // ✅ Good
  <View style={[commonStyles.card, spacingStyles.mb.lg]}>

  // ❌ Bad - Duplicate styles
  <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 24, marginBottom: 24 }}>
  ```

- **Sử dụng TypeScript autocomplete**
  ```typescript
  // TypeScript sẽ suggest tất cả available tokens
  colors.
  spacing.
  typography.fontSize.
  ```

- **Consistent spacing scale**
  ```typescript
  // ✅ Good - Sử dụng spacing scale
  marginBottom: spacing.lg

  // ❌ Bad - Random values
  marginBottom: 23
  ```

### Don'ts ❌

- **Không hardcode colors**
  ```typescript
  // ❌ Bad
  color: '#FF0000'

  // ✅ Good
  color: colors.error
  ```

- **Không tạo custom spacing values**
  ```typescript
  // ❌ Bad
  padding: 13

  // ✅ Good
  padding: spacing.md  // 16
  ```

- **Không ignore platform differences**
  ```typescript
  // ❌ Bad - Không xem xét platform
  height: 50

  // ✅ Good - Sử dụng platform-appropriate sizes
  height: sizes.button.md  // 44px (iOS touch target)
  ```

- **Không overuse shadows**
  ```typescript
  // ❌ Bad - Quá nhiều shadows
  <FlatList
    data={items}
    renderItem={() => <View style={shadows.lg}>...</View>}
  />

  // ✅ Good - Sử dụng borders cho list items
  <FlatList
    data={items}
    renderItem={() => <View style={{ borderWidth: 1, borderColor: colors.border }}>...</View>}
  />
  ```

## Quick Reference

### Import Statement

```typescript
import {
  colors,
  spacing,
  typography,
  shadows,
  borderRadius,
  sizes,
  layout,
  commonStyles,
  spacingStyles,
} from '@/styles';
```

### Most Used Tokens

```typescript
// Colors
colors.primary
colors.text
colors.textSecondary
colors.background
colors.border

// Spacing
spacing.xs    // 4
spacing.sm    // 8
spacing.md    // 16
spacing.lg    // 24
spacing.xl    // 32

// Typography
typography.fontSize.base    // 16
typography.fontSize.lg      // 18
typography.fontWeight.semibold
typography.fontWeight.bold

// Border Radius
borderRadius.sm    // 8
borderRadius.md    // 12
borderRadius.full  // 9999

// Sizes
sizes.button.md    // 44
sizes.input.md     // 44
sizes.icon.md      // 24
```

## Related Documentation

- [COMPONENTS.md](./COMPONENTS.md) - Shared components documentation
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Project architecture
- [src/styles/README.md](../src/styles/README.md) - Quick styles reference

---

**Lưu ý**: Design system này được maintain actively. Nếu cần thêm tokens mới hoặc có suggestions, vui lòng tạo issue hoặc PR.
