import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/shared/components/typography/Text';
import { spacing } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';
import { Input, InputFormat } from '@/shared/components/forms/Input';
import { RadioButton } from '@/shared/components/forms/RadioButton';

interface ShrimpInspectionFoodCheckBoxProps {
    foodAmount: string;
    onFoodAmountChange: (value: string) => void;
    leftoverFood: string;
    onLeftoverFoodChange: (value: string) => void;
}

import { LeftoverFoodEnum } from '@/features/farm/schemas/shrimpInspectionSchema';

const leftoverFoodOptions = [
    { label: 'Hết', value: LeftoverFoodEnum.NONE },
    { label: 'Còn 5–10%', value: LeftoverFoodEnum.LESS_THAN_10 },
    { label: 'Còn 10–15%', value: LeftoverFoodEnum.LESS_THAN_15 },
    { label: 'Còn 15–20%', value: LeftoverFoodEnum.LESS_THAN_20 },
];

export const ShrimpInspectionFoodCheckBox: React.FC<ShrimpInspectionFoodCheckBoxProps> = ({
    foodAmount,
    onFoodAmountChange,
    leftoverFood,
    onLeftoverFoodChange,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    const handleFoodAmountChange = (val: string) => {
        if (onFoodAmountChange) onFoodAmountChange(val);
    };

    return (
        <SelectionInfoBox title="Kiểm tra thức ăn">
            <Input
                label="Lượng thức ăn cho vào nhá (g)"
                placeholder="Lượng thức ăn cho vào nhá (g)"
                value={foodAmount}
                onChangeText={handleFoodAmountChange}
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

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        inputGroup: {
            gap: spacing.sm,
        },
        label: {
            fontSize: 14,
            fontWeight: '500',
            color: theme.text,
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
            borderColor: theme.defaultBorder,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: spacing.xs,
        },
        radioOuterSelected: {
            borderColor: theme.primaryOrange,
        },
        radioInner: {
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: theme.primaryOrange,
        },
        radioLabel: {
            fontSize: 14,
            color: theme.text,
            fontWeight: '400',
            lineHeight: 22,
        },
    });
