import React from 'react';
import { StyleSheet, ViewStyle, TextStyle, View } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { borderRadius, colors, spacing } from '@/styles';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface CollapseHeadProps {
    title: string | React.ReactNode;
    isExpanded: boolean;
    onToggle?: () => void;
    style?: ViewStyle;
    titleStyle?: TextStyle;
    showIcon?: boolean;
    rightComponent?: React.ReactNode;
}

export const CollapseHead: React.FC<CollapseHeadProps> = ({
    title,
    style,
    titleStyle,
    isExpanded = true,
    // onToggle,
    showIcon = false,
    rightComponent,
}) => {
    return (
        <View style={[styles.container, style]} /* onPress={onToggle} */>
            <Text style={[styles.title, titleStyle]} numberOfLines={1}>
                {title}
            </Text>
            <View style={styles.actions}>
                {rightComponent}
                {showIcon && (
                    <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={colors.gray[700]}
                    />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: spacing.md,
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        borderTopLeftRadius: borderRadius.md,
        borderTopRightRadius: borderRadius.md,
        borderColor: colors.border,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 22,
        color: colors.text,
        flex: 1,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
});
