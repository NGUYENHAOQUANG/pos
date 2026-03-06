import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing } from '@/styles';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';

import { Input } from '@/shared/components/forms/Input';
interface ShrimpInspectionFoodCheckBoxProps {
    foodAmount: string;
    onFoodAmountChange: (value: string) => void;
    leftoverFood: string;
    onLeftoverFoodChange: (value: string) => void;
}

const leftoverFoodOptions = ['Hết', 'Còn 5–10%', 'Còn 10–15%', 'Còn 15–20%'];

const renderRadioGroup = (options: string[], selected: string, onSelect: (val: string) => void) => (
    <View style={styles.radioGroup}>
        {options.map(option => (
            <TouchableOpacity
                key={option}
                style={styles.radioItem}
                onPress={() => onSelect(option)}
                activeOpacity={0.8}
            >
                <View style={[styles.radioOuter, selected === option && styles.radioOuterSelected]}>
                    {selected === option && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioLabel}>{option}</Text>
            </TouchableOpacity>
        ))}
    </View>
);

export const ShrimpInspectionFoodCheckBox: React.FC<ShrimpInspectionFoodCheckBoxProps> = ({
    foodAmount,
    onFoodAmountChange,
    leftoverFood,
    onLeftoverFoodChange,
}) => {
    const handleFoodAmountChange = (text: string) => {
        // 1. Remove any character that is not 0-9 or .
        let cleaned = text.replace(/[^0-9.]/g, '');

        // 2. Prevent . at the beginning
        if (cleaned.startsWith('.')) {
            cleaned = cleaned.substring(1);
        }

        // 3. Ensure only one . exists
        const parts = cleaned.split('.');
        if (parts.length > 2) {
            cleaned = parts[0] + '.' + parts.slice(1).join('');
        }

        onFoodAmountChange(cleaned);
    };

    return (
        <SelectionInfoBox title="Kiểm tra thức ăn">
            {/* Lượng thức ăn cho vào nhá */}
            <Input
                label="Lượng thức ăn cho vào nhá (g)"
                placeholder="Nhập lượng thức ăn vào đây nhá"
                value={foodAmount}
                onChangeText={handleFoodAmountChange}
                keyboardType="numeric"
                containerStyle={{ marginBottom: 0 }}
                required
            />

            {/* Thức ăn thừa */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Thức ăn thừa</Text>
                {renderRadioGroup(leftoverFoodOptions, leftoverFood, onLeftoverFoodChange)}
            </View>
        </SelectionInfoBox>
    );
};

const styles = StyleSheet.create({
    inputGroup: {
        gap: spacing.sm,
    },
    label: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.text,
        lineHeight: 22,
    },
    radioGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    radioItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '48%',
        height: 22,
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.xs,
    },
    radioOuterSelected: {
        borderColor: colors.primaryOrange,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primaryOrange,
    },
    radioLabel: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '400',
        lineHeight: 22,
    },
});
