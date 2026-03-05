import React from 'react';
import { Text, StyleSheet, ViewStyle, TextStyle, View, StyleProp } from 'react-native';
import { borderRadius, colors } from '@/styles';

interface CollapseHeadProps {
    title: string | React.ReactNode;
    isExpanded: boolean;
    onToggle: () => void;
    style?: StyleProp<ViewStyle>;
    titleStyle?: StyleProp<TextStyle>;
    showIcon?: boolean;
}

export const CollapseHead: React.FC<CollapseHeadProps> = ({ title, style, titleStyle }) => {
    return (
        <View style={[styles.container, style]}>
            {typeof title === 'string' ? (
                <Text style={[styles.title, titleStyle]} numberOfLines={1}>
                    {title}
                </Text>
            ) : (
                <View style={{ flex: 1 }}>{title}</View>
            )}
        </View>
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
});
