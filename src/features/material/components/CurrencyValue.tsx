import React from 'react';
import { StyleSheet, TextStyle, StyleProp } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { formatCurrencyValue } from '@/shared/utils/formatters';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles';

interface CurrencyValueProps {
    value: number;
    valueStyle?: StyleProp<TextStyle>;
    suffixStyle?: StyleProp<TextStyle>;
}

export const CurrencyValue: React.FC<CurrencyValueProps> = ({ value, valueStyle, suffixStyle }) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    return (
        <Text style={[styles.value, valueStyle]}>
            {formatCurrencyValue(value)}
            <Text style={[styles.suffix, suffixStyle]}> ₫</Text>
        </Text>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        value: {
            fontSize: 18,
            color: theme.primaryOrange,
            fontWeight: '500',
            flexShrink: 1,
        },
        suffix: {
            fontSize: 18,
            fontWeight: '500',
            color: theme.primaryOrange,
        },
    });
