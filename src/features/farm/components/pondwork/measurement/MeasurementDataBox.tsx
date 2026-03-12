import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Input } from '@/shared/components/forms/Input';
import { PondDataBox, ResultItem } from '@/features/farm/components/pondwork/PondDataBox';
import { colors } from '@/styles';
import { formatNumericInput, formatDecimalInput } from '@/shared/utils/formatters';
import { OutlineButton } from '@/shared/components/buttons/OutlineButton';
import { IconAICheck } from '@/assets/icons';

interface MeasurementDataBoxProps {
    shrimpSize: string;
    onShrimpSizeChange: (value: string) => void;
    remainingWeight: string;
    onRemainingWeightChange: (value: string) => void;
    stockingQuantity?: number; // Số lượng thả ban đầu (PLs) để tính tỉ lệ sống
    onAIMeasurePress?: () => void;
    averageSizeCm?: number;
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

        // Result box in the screenshot only shows Total Shrimp and Survival Rate

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
            <OutlineButton
                label="Kiểm tra kích thước tôm bằng AI"
                onPress={onAIMeasurePress || (() => {})}
                prefix={<IconAICheck width={20} height={20} />}
                labelStyle={styles.aiButtonText}
            />

            <Input
                label="Cỡ tôm (con/kg)"
                placeholder="Cỡ tôm (con/kg)"
                value={shrimpSize}
                onChangeText={text => {
                    if (text.length <= 15) {
                        onShrimpSizeChange(formatNumericInput(text));
                    }
                }}
                keyboardType="numeric"
                required
                maxLength={15}
                containerStyle={{ marginBottom: 0 }}
            />
            <Input
                label="Sản lượng còn lại (kg)"
                placeholder="Sản lượng còn lại (kg)"
                value={remainingWeight}
                onChangeText={text => {
                    if (text.length <= 15) {
                        onRemainingWeightChange(formatDecimalInput(text));
                    }
                }}
                keyboardType="numeric"
                required
                maxLength={15}
                containerStyle={{ marginBottom: 0 }}
            />
        </PondDataBox>
    );
};

const styles = StyleSheet.create({
    aiButtonText: {
        color: colors.textSecondary,
        fontSize: 14,
        fontWeight: '500',
    },
});
