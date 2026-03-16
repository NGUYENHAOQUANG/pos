import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '@/styles';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';
import { Input, InputFormat } from '@/shared/components/forms/Input';
import { RadioButton } from '@/shared/components/forms/RadioButton';

interface ShrimpInspectionFoodCheckBoxProps {
    foodAmount: string;
    onFoodAmountChange: (value: string) => void;
    leftoverFood: string;
    onLeftoverFoodChange: (value: string) => void;
}

const leftoverFoodOptions = [
    { label: 'Hết', value: 'Hết' },
    { label: 'Còn 5–10%', value: 'Còn 5–10%' },
    { label: 'Còn 10–15%', value: 'Còn 10–15%' },
    { label: 'Còn 15–20%', value: 'Còn 15–20%' },
];

export const ShrimpInspectionFoodCheckBox: React.FC<ShrimpInspectionFoodCheckBoxProps> = ({
    foodAmount,
    onFoodAmountChange,
    leftoverFood,
    onLeftoverFoodChange,
}) => {
    return (
        <SelectionInfoBox title="Kiểm tra thức ăn">
            <Input
                label="Lượng thức ăn cho vào nhá (g)"
                placeholder="Nhập lượng thức ăn vào đây nhá"
                value={foodAmount}
                onChangeText={onFoodAmountChange}
                keyboardType="numeric"
                inputFormat={InputFormat.DECIMAL}
                containerStyle={{ marginBottom: 0 }}
                required
            />

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Thức ăn thừa</Text>
                <RadioButton
                    options={leftoverFoodOptions}
                    value={leftoverFood}
                    onValueChange={onLeftoverFoodChange}
                    containerStyle={styles.radioGroup}
                    itemStyle={styles.radioItem}
                    gap={0}
                />
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
        flexWrap: 'wrap',
    },
    radioItem: {
        width: '48%',
        paddingVertical: 6,
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
