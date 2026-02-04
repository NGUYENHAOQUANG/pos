import React from 'react';
import { Text } from 'react-native';
import { formatCurrencyValue } from '@/shared/utils/formatters';

export const formatCurrency = (value: number) => {
    return (
        <>
            {formatCurrencyValue(value)} <Text style={{ textDecorationLine: 'underline' }}>đ</Text>
        </>
    );
};
