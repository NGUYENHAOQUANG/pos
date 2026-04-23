import React from 'react';
import { View, StyleSheet } from 'react-native';

import { spacing } from '@/styles';
import { ContactInfo } from '../types/survey.types';
import { Input, InputFormat } from '@/shared/components/forms/Input';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';

export interface SurveyContactInfoProps {
    value?: ContactInfo;
    onChange: (value: ContactInfo) => void;
}

export const SurveyContactInfo: React.FC<SurveyContactInfoProps> = ({ value, onChange }) => {
    const styles = getStyles();

    const handleChange = (field: keyof ContactInfo, text: string) => {
        const newValue = { ...value, [field]: text } as ContactInfo;
        // ensure default empty strings if not present
        if (!newValue.name) newValue.name = '';
        if (!newValue.phone) newValue.phone = '';
        onChange(newValue);
    };

    const formatPhoneDisplay = (phone: string | undefined) => {
        if (!phone) return '';
        const p = phone.replace(/\D/g, '');
        if (p.length > 7) return `${p.slice(0, 4)} ${p.slice(4, 7)} ${p.slice(7, 10)}`;
        if (p.length > 4) return `${p.slice(0, 4)} ${p.slice(4)}`;
        return p;
    };

    return (
        <View style={styles.container}>
            <Input
                label="Họ và tên"
                required
                placeholder="Nhập họ và tên"
                value={value?.name || ''}
                onChangeText={text => handleChange('name', text)}
            />
            <Input
                label="Số điện thoại"
                required
                placeholder="Nhập số điện thoại"
                keyboardType="number-pad"
                inputFormat={InputFormat.INTEGER}
                maxDigits={10}
                value={formatPhoneDisplay(value?.phone)}
                onChangeText={text => handleChange('phone', text)}
                error={
                    value?.phone && !/^(03|05|07|08|09)\d{8}$/.test(value.phone)
                        ? 'Số điện thoại không hợp lệ'
                        : undefined
                }
            />
            <Input
                label="Tỉnh/Thành phố"
                placeholder="Nhập tỉnh/thành phố"
                value={value?.province || ''}
                onChangeText={text => handleChange('province', text)}
            />
            <SelectionNotesBox
                title="Ghi chú thêm"
                plain
                notes={value?.note || ''}
                onNotesChange={text => handleChange('note', text)}
            />
        </View>
    );
};

const getStyles = () =>
    StyleSheet.create({
        container: {
            paddingHorizontal: spacing.lg,
        },
    });
