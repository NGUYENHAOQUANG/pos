import React from 'react';
import { StyleSheet, TextStyle, StyleProp } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { formatCurrencyValue } from '@/shared/utils/formatters';
import { colors } from '@/styles';

interface CurrencyValueProps {
    value: number;
    valueStyle?: StyleProp<TextStyle>;
    suffixStyle?: StyleProp<TextStyle>;
}

export const CurrencyValue: React.FC<CurrencyValueProps> = ({ value, valueStyle, suffixStyle }) => {
    return (
        <Text style={[styles.value, valueStyle]}>
            {formatCurrencyValue(value)}
            <Text style={[styles.suffix, suffixStyle]}> ₫</Text>
        </Text>
    );
};

const styles = StyleSheet.create({
    value: {
        fontSize: 18,
        color: colors.primaryOrange,
        fontWeight: '500',
        flexShrink: 1,
    },
    suffix: {
        fontSize: 18,
        fontWeight: '500',
        color: colors.primaryOrange,
    },
});
