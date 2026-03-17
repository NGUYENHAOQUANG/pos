/**
 * @file AppTextInput.tsx
 * @description Custom TextInput component that automatically applies Google Sans Flex font.
 * Export as `TextInput` so existing JSX doesn't need to change — only the import line.
 *
 * @example
 * // Before: import { TextInput } from 'react-native';
 * // After:  import { TextInput } from '@/shared/components/typography/AppTextInput';
 */
import React from 'react';
import { TextInput as RNTextInput, TextInputProps, StyleSheet } from 'react-native';
import { fontFamily, fontWeightToFamily } from '@/styles/typography';

/**
 * Resolve fontFamily from fontWeight in style
 */
const resolveFontFamily = (style?: TextInputProps['style']): string => {
    if (!style) return fontFamily.regular;

    const flatStyle = StyleSheet.flatten(style);
    if (!flatStyle) return fontFamily.regular;

    if (flatStyle.fontFamily) return flatStyle.fontFamily;

    const weight = flatStyle.fontWeight;
    if (weight && fontWeightToFamily[String(weight)]) {
        return fontWeightToFamily[String(weight)];
    }

    return fontFamily.regular;
};

export const TextInput = React.forwardRef<RNTextInput, TextInputProps>(
    ({ style, ...props }, ref) => {
        const resolvedFamily = resolveFontFamily(style);

        return (
            <RNTextInput
                ref={ref}
                {...props}
                style={[{ fontFamily: resolvedFamily }, style, { fontFamily: resolvedFamily }]}
            />
        );
    }
);
