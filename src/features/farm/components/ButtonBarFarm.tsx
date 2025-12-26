import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/styles';

interface ButtonBarFarmProps {
    primaryTitle?: string;
    secondaryTitle?: string;
    onPrimaryPress?: () => void;
    onSecondaryPress?: () => void;
    primaryDisabled?: boolean;
    // secondaryType: 'default' (gray border) | 'primary' (blue border)
    secondaryType?: 'default' | 'primary';
    style?: StyleProp<ViewStyle>;
}

export const ButtonBarFarm: React.FC<ButtonBarFarmProps> = ({
    primaryTitle,
    secondaryTitle,
    onPrimaryPress,
    onSecondaryPress,
    primaryDisabled = false,
    secondaryType = 'default',
    style,
}) => {
    const insets = useSafeAreaInsets();
    const hasSecondary = !!secondaryTitle;
    const hasPrimary = !!primaryTitle;

    // Primary Button Styles
    const getPrimaryButtonStyle = () => {
        const stylesList: StyleProp<ViewStyle>[] = [styles.button];
        if (primaryDisabled) {
            stylesList.push(styles.primaryButtonDisabled);
        } else {
            stylesList.push(styles.primaryButton);
        }
        return stylesList;
    };

    const getPrimaryTextStyle = () => {
        if (primaryDisabled) {
            return [styles.buttonText, styles.primaryTextDisabled];
        }
        return [styles.buttonText, styles.primaryText];
    };

    // Secondary Button Styles
    const getSecondaryButtonStyle = () => {
        const stylesList: StyleProp<ViewStyle>[] = [styles.button, styles.secondaryButton];
        if (secondaryType === 'primary') {
            stylesList.push(styles.secondaryButtonPrimary);
        } else {
            stylesList.push(styles.secondaryButtonDefault);
        }
        return stylesList;
    };

    const getSecondaryTextStyle = () => {
        if (secondaryType === 'primary') {
            return [styles.buttonText, styles.secondaryTextPrimary];
        }
        return [styles.buttonText, styles.secondaryTextDefault];
    };

    if (!hasSecondary && hasPrimary) {
        return (
            <View style={[styles.container, { paddingBottom: insets.bottom }, style]}>
                <TouchableOpacity
                    style={[getPrimaryButtonStyle(), styles.flex1]}
                    onPress={onPrimaryPress}
                    disabled={primaryDisabled}
                    activeOpacity={0.7}
                >
                    <Text style={getPrimaryTextStyle()}>{primaryTitle}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Double button case
    return (
        <View style={[styles.container, { paddingBottom: insets.bottom }, style]}>
            {hasSecondary && (
                <TouchableOpacity
                    style={getSecondaryButtonStyle()}
                    onPress={onSecondaryPress}
                    activeOpacity={0.7}
                >
                    <Text style={getSecondaryTextStyle()}>{secondaryTitle}</Text>
                </TouchableOpacity>
            )}

            {hasSecondary && hasPrimary && <View style={styles.spacer} />}

            {hasPrimary && (
                <TouchableOpacity
                    style={[getPrimaryButtonStyle(), styles.flex1]}
                    onPress={onPrimaryPress}
                    disabled={primaryDisabled}
                    activeOpacity={0.7}
                >
                    <Text style={getPrimaryTextStyle()}>{primaryTitle}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    spacer: {
        width: spacing.md,
    },
    flex1: {
        flex: 1,
    },
    button: {
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '400',
    },
    // Primary Styles
    primaryButton: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    primaryButtonDisabled: {
        backgroundColor: colors.gray[100],
        borderColor: colors.gray[200],
    },
    primaryText: {
        color: colors.white,
    },
    primaryTextDisabled: {
        color: colors.textTertiary,
    },
    // Secondary Styles
    secondaryButton: {
        backgroundColor: colors.white,
        paddingHorizontal: 16,
    },
    secondaryButtonDefault: {
        borderColor: colors.defaultBorder || colors.border,
    },
    secondaryButtonPrimary: {
        borderColor: colors.primary,
    },
    secondaryTextDefault: {
        color: colors.text,
    },
    secondaryTextPrimary: {
        color: colors.primary,
    },
});
