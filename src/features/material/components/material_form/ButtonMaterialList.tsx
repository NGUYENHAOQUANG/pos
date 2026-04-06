import React from 'react';
import { TouchableOpacity, StyleSheet, StyleProp, ViewStyle, TextStyle, View } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { useAppTheme } from '@/styles/themeContext';
import { Colors, borderRadius, spacing } from '@/styles';

interface ButtonMaterialListProps {
    title: string;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
    textStyle?: TextStyle;
    icon?: React.ReactNode;
}

export const ButtonMaterialList: React.FC<ButtonMaterialListProps> = ({
    title,
    onPress,
    style,
    textStyle,
    icon,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    return (
        <TouchableOpacity
            style={[styles.button, icon ? styles.row : undefined, style]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text style={[styles.text, textStyle]}>{title}</Text>
        </TouchableOpacity>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        button: {
            paddingVertical: spacing.sm,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: theme.borderDark,
            borderRadius: borderRadius.full,
            backgroundColor: theme.background,
        },
        row: {
            flexDirection: 'row',
            paddingHorizontal: spacing.md,
            justifyContent: 'flex-start',
        },
        iconContainer: {
            marginRight: spacing.sm,
        },
        text: {
            fontSize: 14,
            color: theme.text,
            fontWeight: '400',
        },
    });
