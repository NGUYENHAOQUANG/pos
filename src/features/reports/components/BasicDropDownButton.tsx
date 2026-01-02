import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing } from '@/styles';

interface BasicDropDownButtonProps {
    label?: string;
    placeholder?: string;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
    isExpanded?: boolean;
}

export const BasicDropDownButton: React.FC<BasicDropDownButtonProps> = ({
    label,
    placeholder = 'Chọn mục',
    onPress,
    style,
    isExpanded,
}) => {
    return (
        <TouchableOpacity style={[styles.container, style]} onPress={onPress} activeOpacity={0.7}>
            <Text style={[styles.text, !label && styles.placeholder]}>{label || placeholder}</Text>
            <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.text}
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 46,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 0,
    },
    text: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
        flex: 1,
        marginRight: spacing.xs,
    },
    placeholder: {
        fontWeight: '400',
        color: colors.textSecondary,
    },
});
