import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, StyleProp, View } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { borderRadius, colors, spacing } from '@/styles';
import ExpandedIcon from '@/assets/Icon/IconReport/Expanded.svg';

interface BasicDropDownButtonProps {
    label?: string;
    placeholder?: string;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
    isExpanded?: boolean;
    /** Icon hiển thị bên trái (prefix) */
    prefixIcon?: React.ReactNode;
}

export const BasicDropDownButton: React.FC<BasicDropDownButtonProps> = ({
    label,
    placeholder = 'Chọn mục',
    onPress,
    style,
    isExpanded,
    prefixIcon,
}) => {
    return (
        <TouchableOpacity
            style={[
                styles.container,
                style,
                // Bo góc dưới khi thu gọn (chỉ có nút, không có nội dung bên dưới)
                isExpanded === false && styles.roundedBottom,
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {prefixIcon && <View style={styles.prefixIcon}>{prefixIcon}</View>}
            <Text style={[styles.text, !label && styles.placeholder]} numberOfLines={1}>
                {label || placeholder}
            </Text>
            <View style={[styles.expandedIcon, !isExpanded && styles.expandedIconRotate]}>
                <ExpandedIcon width={10} height={6} />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 40,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        backgroundColor: colors.white,
        borderTopLeftRadius: borderRadius.md,
        borderTopRightRadius: borderRadius.md,
        borderBottomWidth: 1,
        borderColor: colors.border,
    },
    roundedBottom: {
        borderBottomLeftRadius: borderRadius.md,
        borderBottomRightRadius: borderRadius.md,
    },
    prefixIcon: {
        marginRight: spacing.sm,
    },
    text: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
        flex: 1,
        marginRight: spacing.xs,
        minWidth: 0,
    },
    expandedIcon: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    expandedIconRotate: {
        transform: [{ rotate: '180deg' }],
    },
    placeholder: {
        fontWeight: '400',
        color: colors.textSecondary,
    },
});
