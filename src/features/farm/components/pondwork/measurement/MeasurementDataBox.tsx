import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Input } from '@/shared/components/forms/Input';
import { PondDataBox, ResultItem } from '@/features/farm/components/pondwork/PondDataBox';
import { borderRadius, colors, spacing } from '@/styles';
import { formatNumericInput, formatDecimalInput } from '@/shared/utils/formatters';

interface MeasurementDataBoxProps {
    shrimpSize: string;
    onShrimpSizeChange: (value: string) => void;
    remainingWeight: string;
    onRemainingWeightChange: (value: string) => void;
    stockingQuantity?: number; // Số lượng thả ban đầu (PLs) để tính tỉ lệ sống
    onAIMeasurePress?: () => void;
    averageSizeCm?: number | null;
}

export const MeasurementDataBox: React.FC<MeasurementDataBoxProps> = ({
    shrimpSize,
    onShrimpSizeChange,
    remainingWeight,
    onRemainingWeightChange,
    stockingQuantity,
    onAIMeasurePress,
    averageSizeCm,
}) => {
    const [totalShrimp, setTotalShrimp] = useState<number | null>(null);
    const [survivalRate, setSurvivalRate] = useState<number | null>(null);

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
                // Làm tròn tối đa 2 chữ số thập phân
                const rate = Math.round((currentTotal / initialStock) * 100 * 100) / 100;
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

        items.push({
            label: 'Trung bình kích thước tôm (cm)',
            value:
                averageSizeCm !== undefined && averageSizeCm !== null
                    ? averageSizeCm.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      })
                    : '-',
        });

        items.push({
            label: 'Tổng số tôm hiện tại (con)',
            value: totalShrimp !== null ? totalShrimp.toLocaleString('en-US') : '-',
        });

        items.push({
            label: 'Tỉ lệ sống dự kiến (%)',
            value:
                survivalRate !== null
                    ? survivalRate.toLocaleString('en-US', {
                          maximumFractionDigits: 2,
                      })
                    : '-',
        });

        return items;
    }, [totalShrimp, survivalRate, averageSizeCm]);

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
            <TouchableOpacity style={styles.aiButton} onPress={onAIMeasurePress}>
                <Text style={styles.aiButtonText}>Đo kích thước & cỡ tôm bằng AI</Text>
            </TouchableOpacity>
        </PondDataBox>
    );
};

const styles = StyleSheet.create({
    inputRow: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    inputColumn: {
        flex: 1,
    },
    aiButton: {
        backgroundColor: colors.blue[50],
        borderWidth: 1,
        borderColor: colors.blue[200],
        paddingVertical: 12,
        borderRadius: borderRadius.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    aiButtonText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '400',
    },
});
