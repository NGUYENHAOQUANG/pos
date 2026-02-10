import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Input } from '@/shared/components/forms/Input';
import { PondDataBox, ResultItem } from '@/features/farm/components/pondwork/PondDataBox';
import { spacing } from '@/styles';
import { formatNumericInput, formatDecimalInput } from '@/shared/utils/formatters';

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
    const [shrimpWeight, setShrimpWeight] = useState<number | null>(null);

    useEffect(() => {
        const size = parseFloat(shrimpSize);
        const weight = parseFloat(remainingWeight);

        if (!isNaN(size) && !isNaN(weight) && size > 0 && weight > 0) {
            // Số con thu = Cỡ tôm (con/kg) × Sản lượng còn lại (kg)
            const currentTotal = Math.round(size * weight);
            setTotalShrimp(currentTotal);

            // Tỉ lệ sống (%) = (Tổng số con hiện tại / Số lượng giống thả ban đầu) × 100
            if (stockingQuantity && Number(stockingQuantity) > 0) {
                const initialStock = Number(stockingQuantity);
                const rate = Math.round((currentTotal / initialStock) * 100);
                setSurvivalRate(rate);
            } else {
                setSurvivalRate(null);
            }
        } else {
            setTotalShrimp(null);
            setSurvivalRate(null);
        }

        if (!isNaN(size) && size > 0) {
            // Trọng lượng trung bình = 1000 / Cỡ tôm
            const weightPerShrimp = 1000 / size;
            // Keep precision for display
            setShrimpWeight(weightPerShrimp);
        } else {
            setShrimpWeight(null);
        }
    }, [shrimpSize, remainingWeight, stockingQuantity]);

    // Build result items
    const resultItems: ResultItem[] = useMemo(() => {
        const items: ResultItem[] = [];

        items.push({
            label: 'Số lượng thả (Pls)',
            value:
                stockingQuantity && Number(stockingQuantity) > 0
                    ? Number(stockingQuantity).toLocaleString('en-US')
                    : '-',
        });

        items.push({
            label: 'Tổng số tôm hiện tại (con)',
            value: totalShrimp !== null ? totalShrimp.toLocaleString('en-US') : '-',
        });

        items.push({
            label: 'Tỉ lệ sống dự kiến (%)',
            value: survivalRate !== null ? survivalRate.toLocaleString('en-US') : '-',
        });

        items.push({
            label: 'Trọng lượng tôm (g/con)',
            value:
                shrimpWeight !== null
                    ? shrimpWeight.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      })
                    : '-',
        });

        return items;
    }, [totalShrimp, survivalRate, shrimpWeight, stockingQuantity]);

    return (
        <PondDataBox title="Số liệu đo" resultItems={resultItems}>
            <View style={styles.inputRow}>
                <View style={styles.inputColumn}>
                    <Input
                        label="Cỡ tôm (con/kg)"
                        value={shrimpSize}
                        onChangeText={text => {
                            if (text.length <= 6) {
                                onShrimpSizeChange(formatNumericInput(text));
                            }
                        }}
                        keyboardType="numeric"
                        required
                        maxLength={6}
                    />
                </View>
                <View style={styles.inputColumn}>
                    <Input
                        label="Sản lượng còn lại (kg)"
                        value={remainingWeight}
                        onChangeText={text => {
                            if (text.length <= 12) {
                                onRemainingWeightChange(formatDecimalInput(text));
                            }
                        }}
                        keyboardType="numeric"
                        required
                        maxLength={9}
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
