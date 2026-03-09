import React from 'react';
import { Text } from 'react-native';
import { formatCurrencyValue } from '@/shared/utils/formatters';
import { View } from 'react-native';

export const formatCurrency = (value: number) => {
    return (
        <View style={{ flexDirection: 'row' }}>
            <Text style={{ fontSize: 14, fontWeight: '500' }}>{formatCurrencyValue(value)}</Text>
            <Text style={{ textDecorationLine: 'underline', fontSize: 14, fontWeight: '500' }}>
                {' '}
                đ
            </Text>
        </View>
    );
};
