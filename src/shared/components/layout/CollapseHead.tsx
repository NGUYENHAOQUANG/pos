import React from 'react';
import { Text, StyleSheet, ViewStyle, TextStyle, View, StyleProp } from 'react-native';
import { borderRadius, colors } from '@/styles';

interface CollapseHeadProps {
    title: string;
    isExpanded: boolean;
    onToggle: () => void;
    style?: StyleProp<ViewStyle>;
    titleStyle?: StyleProp<TextStyle>;
    showIcon?: boolean;
}

export const CollapseHead: React.FC<CollapseHeadProps> = ({ title, style, titleStyle }) => {
    return (
        <View style={[styles.container, style]}>
            <Text style={[styles.title, titleStyle]} numberOfLines={1}>
                {title}
            </Text>
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
