import React from 'react';
import {
    Text,
    StyleSheet,
    ViewStyle,
    TextStyle,
    View,
    TouchableOpacity,
    StyleProp,
} from 'react-native';
import { borderRadius, colors, spacing } from '@/styles';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface CollapseHeadProps {
    title: string;
    isExpanded: boolean;
    onToggle?: () => void;
    style?: StyleProp<ViewStyle>;
    titleStyle?: StyleProp<TextStyle>;
    showIcon?: boolean;
    rightComponent?: React.ReactNode;
}

export const CollapseHead: React.FC<CollapseHeadProps> = ({
    title,
    style,
    titleStyle,
    isExpanded = true,
    onToggle,
    showIcon = false,
    rightComponent,
}) => {
    return (
        <TouchableOpacity style={[styles.container, style]} onPress={onToggle} activeOpacity={0.7}>
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
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 12,
        paddingHorizontal: 12,
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        borderTopLeftRadius: borderRadius.md,
        borderTopRightRadius: borderRadius.md,
        borderColor: colors.border,
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
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
