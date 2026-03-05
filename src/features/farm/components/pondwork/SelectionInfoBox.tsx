import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

import { colors, spacing } from '@/styles';

interface SelectionInfoBoxProps {
    title: string | React.ReactNode;
    children: React.ReactNode;
    style?: ViewStyle;
    titleStyle?: TextStyle;
}

export const SelectionInfoBox: React.FC<SelectionInfoBoxProps> = ({
    title,
    children,
    style,
    titleStyle,
}) => {
    return (
        <View style={[styles.infoBox, style]}>
            {typeof title === 'string' ? (
                <Text style={[styles.sectionTitle, titleStyle]}>{title}</Text>
            ) : (
                <View style={styles.titleContainer}>{title}</View>
            )}
            <View style={styles.divider} />
            <View style={styles.childrenContainer}>{children}</View>
        </View>
    );
};

const styles = StyleSheet.create({
    infoBox: {
        backgroundColor: colors.white,
        paddingHorizontal: spacing.md,
        marginTop: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.borderSubtle || colors.gray[100],
        paddingVertical: 12,
    },
    titleContainer: {
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        lineHeight: 22,
        color: colors.text,
        marginBottom: 12,
    },
    divider: {
        height: 1,
        backgroundColor: colors.borderLight,
        marginBottom: 12,
        marginHorizontal: -spacing.md,
    },
    childrenContainer: {
        gap: spacing.md,
    },
});
