import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';

type CheckboxSize = 'sm' | 'md' | 'lg';

interface CheckboxSizeConfig {
    box: number;
    radius: number;
    iconSize: number;
}

const CHECKBOX_SIZES: Record<CheckboxSize, CheckboxSizeConfig> = {
    sm: { box: 16, radius: 3, iconSize: 10 },
    md: { box: 20, radius: 4, iconSize: 14 },
    lg: { box: 24, radius: 5, iconSize: 16 },
};

interface CheckboxProps {
    /** Whether the checkbox is checked */
    checked: boolean;
    /** Callback when checkbox is toggled */
    onToggle?: (checked: boolean) => void;
    /** Optional label text displayed next to checkbox */
    label?: string;
    /** Disable checkbox interaction */
    disabled?: boolean;
    /** Size preset: 'sm' (16px), 'md' (20px), 'lg' (24px) */
    size?: CheckboxSize;
    /** Custom active/checked color (default: theme.primary) */
    activeColor?: string;
    /** Indicator for validation error */
    hasError?: boolean;
    /** Custom container styles */
    style?: ViewStyle;
    /** Custom label styles */
    labelStyle?: TextStyle;
}

/**
 * Reusable Checkbox component
 * Renders a rounded-square checkbox with checkmark icon
 * Supports sm/md/lg sizes, custom colors, labels, and disabled state
 *
 * Figma specs (md):
 * - Container: 20x20, borderRadius: 4
 * - Checked: background = activeColor, white checkmark (12x12 area)
 * - Unchecked: border 1.5px gray[300]
 */
export const Checkbox: React.FC<CheckboxProps> = ({
    checked,
    onToggle,
    label,
    disabled = false,
    size = 'md',
    activeColor,
    hasError,
    style,
    labelStyle,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    const sizeConfig = CHECKBOX_SIZES[size];

    const handlePress = () => {
        if (disabled) return;
        onToggle?.(!checked);
    };

    return (
        <TouchableOpacity
            style={[styles.container, disabled && styles.disabled, style]}
            onPress={handlePress}
            activeOpacity={0.7}
            disabled={disabled}
        >
            <View
                style={[
                    styles.box,
                    {
                        width: sizeConfig.box,
                        height: sizeConfig.box,
                        borderRadius: sizeConfig.radius,
                    },
                    checked
                        ? {
                              backgroundColor: activeColor || theme.primary,
                              borderColor: activeColor || theme.primary,
                          }
                        : [styles.boxUnchecked, hasError ? { borderColor: theme.error } : null],
                    disabled && styles.boxDisabled,
                ]}
            >
                {checked && (
                    <Ionicons name="checkmark-sharp" size={sizeConfig.iconSize} color="#FFFFFF" />
                )}
            </View>
            {label ? (
                <Text style={[styles.label, disabled && styles.labelDisabled, labelStyle]}>
                    {label}
                </Text>
            ) : null}
        </TouchableOpacity>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        disabled: {
            opacity: 0.5,
        },
        box: {
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1.5,
            borderColor: 'transparent',
        },
        boxUnchecked: {
            backgroundColor: 'transparent',
            borderColor: theme.defaultBorder,
        },
        boxDisabled: {
            borderColor: theme.borderLight,
        },
        label: {
            marginLeft: 8,
            fontSize: 14,
            fontWeight: '400',
            lineHeight: 20,
            color: theme.text,
        },
        labelDisabled: {
            color: theme.textTertiary,
        },
    });
