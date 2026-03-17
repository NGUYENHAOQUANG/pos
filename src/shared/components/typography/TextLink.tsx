/**
 * @file TextLink.tsx
 * @description TextLink component following Ant Design principles with system colors
 * @author Kindy
 * @created 2025-01-XX
 * @updated 2025-01-XX - Redesigned with full Ant Design styling and multiple link support
 */
import React from 'react';
import { TouchableOpacity, View, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { colors, typography } from '@/styles';

export interface LinkItem {
    /** Link text */
    text: string;
    /** Callback when link is pressed */
    onPress: () => void;
}

export interface TextLinkProps {
    /** Simple link text (when using simple link mode) */
    linkText?: string;
    /** Callback when simple link is pressed */
    onPress?: () => void;
    /** Regular text before link (for text + link mode) */
    text?: string;
    /** Regular text after link (for text + link mode) */
    textAfter?: string;
    /** Multiple links with text (for complex text with multiple links) */
    links?: LinkItem[];
    /** Alignment of the text */
    align?: 'left' | 'center' | 'right';
    /** Link color */
    linkColor?: string;
    /** Text color */
    textColor?: string;
    /** Font size */
    fontSize?: number;
    /** Custom container styles */
    containerStyle?: ViewStyle;
    /** Custom text styles */
    textStyle?: TextStyle;
    /** Custom link styles */
    linkStyle?: TextStyle;
}

/**
 * TextLink component with Ant Design styling and system colors
 * Supports simple links, text with links, and multiple links in one line
 */
export function TextLink({
    linkText,
    onPress,
    text,
    textAfter,
    links,
    align = 'left',
    linkColor = colors.primary,
    textColor = colors.textSecondary,
    fontSize = typography.fontSize.sm,
    containerStyle,
    textStyle,
    linkStyle,
}: TextLinkProps) {
    // Simple link mode (only linkText)
    if (linkText && onPress && !text && !links) {
        return (
            <View
                style={[
                    styles.container,
                    { justifyContent: getJustifyContent(align) },
                    containerStyle,
                ]}
            >
                <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
                    <Text style={[styles.link, { color: linkColor, fontSize }, linkStyle]}>
                        {linkText}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Text + Link mode
    if (text && linkText && onPress && !links) {
        return (
            <View
                style={[
                    styles.container,
                    { justifyContent: getJustifyContent(align) },
                    containerStyle,
                ]}
            >
                <Text style={[styles.text, { color: textColor, fontSize }, textStyle]}>
                    {text}{' '}
                </Text>
                <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
                    <Text style={[styles.link, { color: linkColor, fontSize }, linkStyle]}>
                        {linkText}
                    </Text>
                </TouchableOpacity>
                {textAfter && (
                    <Text style={[styles.text, { color: textColor, fontSize }, textStyle]}>
                        {' '}
                        {textAfter}
                    </Text>
                )}
            </View>
        );
    }

    // Multiple links mode
    if (links && links.length > 0) {
        return (
            <View
                style={[
                    styles.container,
                    { justifyContent: getJustifyContent(align) },
                    containerStyle,
                ]}
            >
                {text && (
                    <Text style={[styles.text, { color: textColor, fontSize }, textStyle]}>
                        {text}{' '}
                    </Text>
                )}
                {links.map((link, index) => (
                    <React.Fragment key={index}>
                        <TouchableOpacity onPress={link.onPress} activeOpacity={0.7}>
                            <Text style={[styles.link, { color: linkColor, fontSize }, linkStyle]}>
                                {link.text}
                            </Text>
                        </TouchableOpacity>
                        {index < links.length - 1 && (
                            <Text style={[styles.text, { color: textColor, fontSize }, textStyle]}>
                                {' '}
                                và{' '}
                            </Text>
                        )}
                    </React.Fragment>
                ))}
                {textAfter && (
                    <Text style={[styles.text, { color: textColor, fontSize }, textStyle]}>
                        {' '}
                        {textAfter}
                    </Text>
                )}
            </View>
        );
    }

    // No valid configuration
    return null;
}

// Helper function to get justifyContent based on align
function getJustifyContent(
    align: 'left' | 'center' | 'right'
): 'flex-start' | 'center' | 'flex-end' {
    switch (align) {
        case 'left':
            return 'flex-start';
        case 'center':
            return 'center';
        case 'right':
            return 'flex-end';
        default:
            return 'flex-start';
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    text: {
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
    },
    link: {
        fontSize: typography.fontSize.sm,
        color: colors.primary,
        fontWeight: typography.fontWeight.regular,
    },
});
