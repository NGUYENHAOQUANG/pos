import React from 'react';
import { View, Text, StyleSheet, StyleProp, TextStyle, ViewStyle } from 'react-native';
import { colors } from '@/styles';

export interface DetailRowProps {
    label: string;
    value?: React.ReactNode | string | number | null;
    labelStyle?: StyleProp<TextStyle>;
    valueStyle?: StyleProp<TextStyle>;
    style?: StyleProp<ViewStyle>;
    isSpaceBetween?: boolean;
}

export const DetailRow: React.FC<DetailRowProps> = ({
    label,
    value,
    labelStyle,
    valueStyle,
    style,
    isSpaceBetween = true,
}) => {
    const display = value !== null && value !== undefined && value !== '' ? value : '---';

    return (
        <View style={[styles.detailRow, isSpaceBetween && styles.detailRowSpaceBetween, style]}>
            <Text style={[styles.detailLabel, labelStyle]}>{label}</Text>
            {typeof display === 'string' || typeof display === 'number' ? (
                <Text style={[styles.detailValue, valueStyle]}>{display}</Text>
            ) : (
                display
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
    },
    detailLabel: {
        fontWeight: '400',
        fontSize: 14,
        color: colors.gray[500],
        lineHeight: 20,
    },
    detailValue: {
        fontSize: 14,
        color: colors.gray[950],
        fontWeight: '500',
        lineHeight: 20,
    },
    detailLabelSpaceBetween: {
        flex: 1,
    },
    detailRowSpaceBetween: {
        justifyContent: 'space-between',
    },
});
