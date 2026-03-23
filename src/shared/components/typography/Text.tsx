/**
 * @file Text.tsx
 * @description Custom Text component that automatically applies Google Sans Flex font.
 * Export as `Text` so existing JSX doesn't need to change — only the import line.
 * Auto-resolves fontWeight to the correct font file.
 *
 * @example
 * // Just change import:
 * // Before: import { View, Text } from 'react-native';
 * // After:  import { View } from 'react-native';
 * //         import { Text } from '@/shared/components/typography/Text';
 *
 * // JSX stays the same:
 * <Text style={{ fontWeight: '700' }}>Bold text</Text>
 */
import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { fontFamily, fontWeightToFamily } from '@/styles/typography';

const resolveFontFamily = (style?: TextProps['style']): string => {
    if (!style) return fontFamily.regular;

    // Flatten style array to get final computed style
    const flatStyle = StyleSheet.flatten(style);
    if (!flatStyle) return fontFamily.regular;

    // If fontFamily is already explicitly set, respect it
    if (flatStyle.fontFamily) return flatStyle.fontFamily;

    // Map fontWeight to corresponding font file
    const weight = flatStyle.fontWeight;
    if (weight && fontWeightToFamily[String(weight)]) {
        return fontWeightToFamily[String(weight)];
    }

    return fontFamily.regular;
};

export const Text: React.FC<TextProps> = ({ style, children, ...props }) => {
    const resolvedFamily = resolveFontFamily(style);

    return (
        <RNText
            {...props}
            style={[
                {
                    fontFamily: resolvedFamily,
                    includeFontPadding: false,
                    textAlignVertical: 'center',
                    letterSpacing: 0.2,
                },
                style,
                { fontFamily: resolvedFamily },
            ]}
        >
            {typeof children === 'string' || typeof children === 'number'
                ? `${children} `
                : children}
        </RNText>
    );
};
