import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, StyleProp, View } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { borderRadius, spacing } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import ExpandedIcon from '@/assets/Icon/IconReport/Expanded.svg';

interface BasicDropDownButtonProps {
    label?: string;
    placeholder?: string;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
    isExpanded?: boolean;
    /** Icon hiển thị bên trái (prefix) */
    prefixIcon?: React.ReactNode;
    /** Custom content displayed after label (e.g. badge) */
    suffixContent?: React.ReactNode;
}

export const BasicDropDownButton: React.FC<BasicDropDownButtonProps> = ({
    label,
    placeholder = 'Chọn mục',
    onPress,
    style,
    isExpanded,
    prefixIcon,
    suffixContent,
}) => {
    const theme = useAppTheme();

    const renderPrefixIcon = () => {
        if (!prefixIcon) return null;
        if (React.isValidElement(prefixIcon)) {
            return React.cloneElement(
                prefixIcon as React.ReactElement,
                { color: theme.text } as any
            );
        }
        return prefixIcon;
    };

    return (
        <TouchableOpacity
            style={[
                styles.container,
                {
                    backgroundColor: theme.backgroundButton,
                    borderColor: theme.border,
                    borderBottomWidth: isExpanded ? 1 : 0,
                },
                style,
                // Bo góc dưới khi thu gọn (chỉ có nút, không có nội dung bên dưới)
                isExpanded === false && styles.roundedBottom,
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.labelRow}>
                {prefixIcon && <View style={styles.prefixIcon}>{renderPrefixIcon()}</View>}
                <Text
                    style={[
                        styles.text,
                        { color: theme.text },
                        !label && [styles.placeholder, { color: theme.textSecondary }],
                    ]}
                    numberOfLines={1}
                >
                    {label || placeholder}
                </Text>
                {suffixContent}
            </View>
            <View style={[styles.expandedIcon, !isExpanded && styles.expandedIconRotate]}>
                <ExpandedIcon width={10} height={6} color={theme.text} />
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
        borderTopLeftRadius: borderRadius.md,
        borderTopRightRadius: borderRadius.md,
    },
    roundedBottom: {
        borderBottomLeftRadius: borderRadius.md,
        borderBottomRightRadius: borderRadius.md,
    },
    prefixIcon: {
        marginRight: spacing.sm,
    },
    labelRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    text: {
        fontSize: 14,
        fontWeight: '500',
        marginRight: spacing.xs,
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
    },
});
