import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { FarmInput } from '@/features/farm/components/pondwork/FarmInput';
import { PondDataBox, ResultItem } from '@/features/farm/components/pondwork/PondDataBox';
import { formatNumber } from '@/features/farm/utils/numberUtils';
import { spacing } from '@/styles';

interface MeasurementDataBoxProps {
    shrimpSize: string;
    onShrimpSizeChange: (value: string) => void;
    remainingWeight: string;
    onRemainingWeightChange: (value: string) => void;
    stockingQuantity?: number; // Số lượng thả ban đầu (PLs) để tính tỉ lệ sống
}

export const MeasurementDataBox: React.FC<MeasurementDataBoxProps> = ({
    shrimpSize,
    onShrimpSizeChange,
    remainingWeight,
    onRemainingWeightChange,
    stockingQuantity,
}) => {
    const [totalShrimp, setTotalShrimp] = useState<number | null>(null);
    const [survivalRate, setSurvivalRate] = useState<number | null>(null);

    useEffect(() => {
        const size = parseFloat(shrimpSize);
        const weight = parseFloat(remainingWeight);

        if (!isNaN(size) && !isNaN(weight) && size > 0 && weight > 0) {
            // Số con thu = Cỡ tôm (con/kg) × Sản lượng còn lại (kg)
            const currentTotal = size * weight;
            setTotalShrimp(currentTotal);

            // Tỉ lệ sống (%) = (Tổng số con hiện tại / Số lượng giống thả ban đầu) × 100
            if (stockingQuantity && Number(stockingQuantity) > 0) {
                const initialStock = Number(stockingQuantity);
                const rate = (currentTotal / initialStock) * 100;
                setSurvivalRate(rate);
            } else {
                setSurvivalRate(null);
            }
        } else {
            setTotalShrimp(null);
            setSurvivalRate(null);
        }
    }, [shrimpSize, remainingWeight, stockingQuantity]);

    // Build result items
    const resultItems: ResultItem[] = useMemo(() => {
        const items: ResultItem[] = [];

        if (totalShrimp !== null) {
            items.push({
                label: 'Tổng số tôm hiện tại (con)',
                value: Math.round(totalShrimp).toString(),
            });
        } else {
            items.push({
                label: 'Tổng số tôm hiện tại (con)',
                value: '-',
            });
        }

        if (survivalRate !== null) {
            items.push({
                label: 'Tỉ lệ sống dự kiến (%)',
                value: formatNumber(Math.round(survivalRate)),
            });
        } else {
            items.push({
                label: 'Tỉ lệ sống dự kiến (%)',
                value: '-',
            });
        }

        return items;
    }, [totalShrimp, survivalRate]);

    return (
        <PondDataBox title="Số liệu đo" resultItems={resultItems}>
            <View style={styles.inputRow}>
                <View style={styles.inputColumn}>
                    <FarmInput
                        label="Cỡ tôm (con/kg)"
                        value={shrimpSize}
                        onChangeText={onShrimpSizeChange}
                        keyboardType="numeric"
                        required
                    />
                </View>
                <View style={styles.inputColumn}>
                    <FarmInput
                        label="Sản lượng còn lại (kg)"
                        value={remainingWeight}
                        onChangeText={onRemainingWeightChange}
                        keyboardType="numeric"
                        required
                    />
                </View>
            </View>
        </PondDataBox>
    );
};

const styles = StyleSheet.create({
    inputRow: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    inputColumn: {
        flex: 1,
    },
});
