import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    StyleProp,
    ViewStyle,
    TextStyle,
    View,
} from 'react-native';
import { colors, borderRadius, spacing } from '@/styles';

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

const styles = StyleSheet.create({
    button: {
        paddingVertical: spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.borderDark,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.white,
    },
    row: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        justifyContent: 'flex-start', // Align start when icon is present
    },
    iconContainer: {
        marginRight: spacing.sm,
    },
    text: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '400',
    },
});
