import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';

import { colors, spacing } from '@/styles';
import { PondDataBox } from '@/features/farm/components/pondwork/PondDataBox';
import { DateInputButton } from '@/features/farm/components/pondwork/DateInputButton';
import { Input, InputFormat } from '@/shared/components/forms/Input';

import { Control, Controller, useWatch } from 'react-hook-form';
import { CreateCycleFormValues } from '@/features/farm/schemas/createCycleSchema';
import { BreedOption, PondData } from '@/features/farm/types/farm.types';

import { parseDate } from '@/features/farm/utils/dateUtils';
import { OutlineButton } from '@/shared/components/buttons/OutlineButton';
import { IconAICheck } from '@/assets/icons';

interface Props {
    control: Control<CreateCycleFormValues>;
    pondId?: string;
    pond?: PondData;
    breedOptions: BreedOption[];
    isEdit?: boolean;
    onPressCountingShrimp?: () => void;
}

const StockingInfoSection: React.FC<Props> = ({
    control,
    pondId,
    pond,
    breedOptions,
    isEdit = false,
    onPressCountingShrimp,
}) => {
    const activeBreedSource = useWatch({ control, name: 'breedSource' });
    const activeStockingQuantity = useWatch({ control, name: 'stockingQuantity' });

    const estimatedCost = useMemo(() => {
        if (!activeBreedSource || !activeStockingQuantity) {
            return 0;
        }

        const selectedBreed = breedOptions.find(o => String(o.value) === activeBreedSource);
        if (!selectedBreed?.price) {
            return 0;
        }

        const quantity = parseFloat(activeStockingQuantity);
        if (isNaN(quantity) || quantity <= 0) {
            return 0;
        }

        return selectedBreed.price * quantity;
    }, [activeBreedSource, activeStockingQuantity, breedOptions]);

    const density = useMemo(() => {
        if (!activeStockingQuantity || !pondId) {
            return 0;
        }

        let areaVal = pond?.areaSqm;
        if (!areaVal && pond?.area) {
            const areaStr = String(pond.area).replace(/[^0-9.]/g, '');
            areaVal = parseFloat(areaStr);
        }

        if (!areaVal || isNaN(areaVal) || areaVal <= 0) {
            return 0;
        }

        const quantity = parseFloat(activeStockingQuantity);
        if (isNaN(quantity) || quantity <= 0) {
            return 0;
        }

        return Math.round(quantity / areaVal);
    }, [activeStockingQuantity, pondId, pond]);

    return (
        <PondDataBox
            title="Thông tin thả giống"
            resultItems={[
                {
                    label: 'Mật độ (con/m²)',
                    value: density > 0 ? density : '-',
                },
                {
                    label: 'Tổng chi phí \ngiống ước tính (VNĐ)',
                    value: estimatedCost > 0 ? estimatedCost : '-',
                },
            ]}
        >
            <Controller
                control={control}
                name="stockingDate"
                render={({ field: { value } }) => (
                    <DateInputButton
                        label="Ngày thả"
                        date={
                            value
                                ? typeof value === 'string' && value.includes('/')
                                    ? parseDate(value)
                                    : new Date(value)
                                : null
                        }
                        onDateChange={() => {}}
                        disabled
                        dateText={!isEdit && value ? `${value} (hiện tại)` : undefined}
                        formatOptions={{
                            showCurrentLabel: 'auto',
                        }}
                    />
                )}
            />

            <View style={styles.inputsWrapper}>
                <Controller
                    control={control}
                    name="stockingQuantity"
                    render={({ field: { onChange, value } }) => (
                        <Input
                            label="Tổng số lượng thả (PLs)"
                            required
                            containerStyle={{ marginBottom: 0 }}
                            placeholder="Vd: 200.000"
                            keyboardType="numeric"
                            value={value || ''}
                            onChangeText={onChange}
                            inputFormat={InputFormat.INTEGER}
                            maxDigits={10}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="age"
                    render={({ field: { onChange, value } }) => (
                        <Input
                            label="Ngày tuổi (PLs)"
                            required
                            containerStyle={{ marginBottom: 0 }}
                            placeholder="Vd: 10"
                            keyboardType="numeric"
                            value={value || ''}
                            onChangeText={onChange}
                            inputFormat={InputFormat.INTEGER}
                            maxDigits={5}
                        />
                    )}
                />

                <OutlineButton
                    label="Kiểm đếm tôm giống bằng AI"
                    onPress={onPressCountingShrimp || (() => {})}
                    prefix={<IconAICheck width={20} height={20} />}
                    labelStyle={styles.aiButtonText}
                />
            </View>
        </PondDataBox>
    );
};

export default StockingInfoSection;

const styles = StyleSheet.create({
    inputsWrapper: {
        gap: spacing.md,
    },
    aiButtonText: {
        color: colors.textSecondary,
        fontSize: 14,
        fontWeight: '500',
    },
});
