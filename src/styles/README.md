# Styles System - Quick Reference

> 📖 **Xem hướng dẫn chi tiết tại [docs/STYLES_GUIDE.md](../docs/STYLES_GUIDE.md)**

Hệ thống styles tập trung để dễ dàng quản lý và thay đổi giao diện app.

## Import

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

## Quick Lookup Tables

### Colors

| Token | Value | Use Case |
|-------|-------|----------|
| `colors.primary` | `#007AFF` | Primary buttons, links |
| `colors.secondary` | `#5856D6` | Secondary actions |
| `colors.success` | `#34C759` | Success states |
| `colors.warning` | `#FF9500` | Warnings |
| `colors.error` | `#FF3B30` | Errors |
| `colors.text` | `#111827` | Primary text |
| `colors.textSecondary` | `#6B7280` | Secondary text |
| `colors.textTertiary` | `#9CA3AF` | Placeholders |
| `colors.background` | `#FFFFFF` | Main background |
| `colors.border` | `#E5E7EB` | Borders |
| `colors.gray[50-900]` | - | Gray scale |

### Spacing

| Token | Size | Use Case |
|-------|------|----------|
| `spacing.xs` | 4px | Minimal gaps |
| `spacing.sm` | 8px | Small gaps |
| `spacing.md` | 16px | Default spacing |
| `spacing.lg` | 24px | Section spacing |
| `spacing.xl` | 32px | Large gaps |
| `spacing['2xl']` | 48px | Extra large |
| `spacing['3xl']` | 64px | Maximum |

### Typography

| Token | Value | Use Case |
|-------|-------|----------|
| `typography.fontSize.xs` | 12 | Captions |
| `typography.fontSize.sm` | 14 | Small text |
| `typography.fontSize.base` | 16 | Body text |
| `typography.fontSize.lg` | 18 | Subtitles |
| `typography.fontSize.xl` | 20 | Card titles |
| `typography.fontSize['2xl']` | 24 | Headings |
| `typography.fontSize['3xl']` | 30 | Page titles |
| `typography.fontWeight.regular` | '400' | Body text |
| `typography.fontWeight.medium` | '500' | Emphasized |
| `typography.fontWeight.semibold` | '600' | Subheadings |
| `typography.fontWeight.bold` | '700' | Headings |

### Border Radius

| Token | Size | Use Case |
|-------|------|----------|
| `borderRadius.sm` | 8 | Buttons, inputs |
| `borderRadius.md` | 12 | Cards |
| `borderRadius.lg` | 16 | Large cards |
| `borderRadius.xl` | 20 | Modals |
| `borderRadius.full` | 9999 | Circles, pills |

### Sizes

| Token | Size | Use Case |
|-------|------|----------|
| `sizes.icon.md` | 24 | Default icons |
| `sizes.button.md` | 44 | Standard buttons |
| `sizes.input.md` | 44 | Standard inputs |
| `sizes.avatar.md` | 40 | Standard avatars |

### Shadows

| Token | Use Case |
|-------|----------|
| `shadows.sm` | Subtle cards |
| `shadows.md` | Standard cards |
| `shadows.lg` | Elevated elements |
| `shadows.xl` | Modals, dropdowns |

## Common Patterns

### Card

```typescript
<View style={[commonStyles.card, spacingStyles.mb.md]}>
  <Text>Card content</Text>
</View>
```

### Button

```typescript
<TouchableOpacity
  style={{
    backgroundColor: colors.primary,
    height: sizes.button.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.sm,
    ...layout.centered,
  }}
>
  <Text style={{ color: colors.white, fontWeight: typography.fontWeight.semibold }}>
    Button
  </Text>
</TouchableOpacity>
```

### Input

```typescript
<TextInput
  style={{
    height: sizes.input.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: typography.fontSize.base,
  }}
/>
```

### Row Layout

```typescript
<View style={[layout.rowBetween, spacingStyles.mb.md]}>
  <Text>Left</Text>
  <Text>Right</Text>
</View>
```

### Screen Container

```typescript
<View style={commonStyles.containerPadded}>
  <View style={commonStyles.header}>
    <Text style={commonStyles.headerTitle}>Title</Text>
  </View>
  {/* Content */}
</View>
```

### Empty State

```typescript
<View style={commonStyles.emptyState}>
  <View style={commonStyles.emptyIconContainer}>
    {/* Icon */}
  </View>
  <Text style={commonStyles.emptyTitle}>No Data</Text>
  <Text style={commonStyles.emptyDescription}>Description</Text>
</View>
```

## Common Styles Utilities

### Containers
- `commonStyles.container` - Flex 1, white background
- `commonStyles.containerPadded` - Container + horizontal padding

### Cards
- `commonStyles.card` - White card with shadow
- `commonStyles.cardLarge` - Larger card variant

### Layout
- `commonStyles.row` - Horizontal row
- `commonStyles.rowBetween` - Row with space-between
- `commonStyles.rowCenter` - Centered row
- `layout.centered` - Center content
- `layout.flex.flex1` - Flex: 1

### Spacing Utilities
- `spacingStyles.mt.md` - Margin top 16
- `spacingStyles.mb.lg` - Margin bottom 24
- `spacingStyles.px.md` - Padding horizontal 16
- `spacingStyles.py.sm` - Padding vertical 8

### Text
- `commonStyles.textCenter` - Centered text
- `commonStyles.textBold` - Bold text
- `commonStyles.textSemibold` - Semibold text

## Usage Tips

### ✅ Do's

```typescript
// Use design tokens
backgroundColor: colors.primary
padding: spacing.md

// Combine utilities
<View style={[commonStyles.card, spacingStyles.mb.lg]}>

// Use TypeScript autocomplete
colors.
spacing.
typography.fontSize.
```

### ❌ Don'ts

```typescript
// Don't hardcode values
backgroundColor: '#007AFF'  // ❌
padding: 16                 // ❌

// Don't create random spacing
marginBottom: 23            // ❌

// Use tokens instead
backgroundColor: colors.primary  // ✅
padding: spacing.md             // ✅
marginBottom: spacing.lg        // ✅
```

## Cấu trúc Files

```
src/styles/
├── colors.ts          # Màu sắc
├── spacing.ts         # Khoảng cách
├── typography.ts      # Typography
├── shadows.ts         # Shadows
├── borderRadius.ts    # Border radius
├── layout.ts          # Layout utilities
├── sizes.ts           # Sizes
├── commonStyles.ts    # Common styles
└── index.ts           # Export tất cả
```

## Lợi ích

✅ **Consistency**: UI đồng nhất xuyên suốt app
✅ **Maintainability**: Thay đổi 1 chỗ, áp dụng toàn app
✅ **Type Safety**: TypeScript autocomplete
✅ **Performance**: StyleSheet.create() optimized
✅ **Developer Experience**: Dễ sử dụng, dễ nhớ

---

📖 **Xem thêm**: [STYLES_GUIDE.md](../docs/STYLES_GUIDE.md) - Hướng dẫn chi tiết với examples và best practices
