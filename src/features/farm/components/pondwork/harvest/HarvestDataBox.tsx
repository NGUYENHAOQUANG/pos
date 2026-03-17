import React, { useMemo } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Input, InputFormat } from '@/shared/components/forms/Input';
import { PondDataBox, ResultItem } from '@/features/farm/components/pondwork/PondDataBox';

interface HarvestDataBoxProps {
    yieldAmount?: string | number;
    onYieldAmountChange?: (value: string) => void;
    shrimpSize?: string | number;
    onShrimpSizeChange?: (value: string) => void;
    referencePrice?: string | number;
    onReferencePriceChange?: (value: string) => void;
    containerStyle?: ViewStyle;
}

export const HarvestDataBox: React.FC<HarvestDataBoxProps> = ({
    yieldAmount = '',
    onYieldAmountChange,
    shrimpSize = '',
    onShrimpSizeChange,
    referencePrice = '',
    onReferencePriceChange,
    containerStyle,
}) => {
    // Calculate revenue: yieldAmount * referencePrice
    const revenue = useMemo(() => {
        const yieldValue = parseFloat(String(yieldAmount).replace(/[^\d.]/g, '')) || 0;
        const price = parseFloat(String(referencePrice).replace(/[^\d.]/g, '')) || 0;
        if (yieldValue > 0 && price > 0) {
            return yieldValue * price;
        }
        return null;
    }, [yieldAmount, referencePrice]);

    const resultItems: ResultItem[] = [
        { label: 'Doanh thu (VNĐ)', value: revenue !== null ? revenue : '-' },
    ];

    return (
        <PondDataBox
            title="Số liệu thu hoạch"
            resultItems={resultItems}
            containerStyle={containerStyle}
        >
            <Input
                label="Sản lượng (kg)"
                placeholder="Sản lượng (kg)"
                value={String(yieldAmount)}
                onChangeText={onYieldAmountChange}
                inputFormat={InputFormat.DECIMAL}
                maxDigits={20}
                keyboardType="numeric"
                required
                containerStyle={styles.inputGap}
            />

            <Input
                label="Cỡ tôm (con/kg)"
                placeholder="Cỡ tôm (con/kg)"
                value={String(shrimpSize)}
                onChangeText={onShrimpSizeChange}
                inputFormat={InputFormat.DECIMAL}
                maxDigits={20}
                keyboardType="numeric"
                required
                containerStyle={styles.inputGap}
            />

            <Input
                label="Giá tôm tham khảo (VNĐ/kg)"
                placeholder="Giá tôm tham khảo (VNĐ/kg)"
                value={String(referencePrice)}
                onChangeText={onReferencePriceChange}
                inputFormat={InputFormat.DECIMAL}
                maxDigits={20}
                keyboardType="numeric"
                required
                containerStyle={styles.lastInput}
            />
        </PondDataBox>
    );
};

const styles = StyleSheet.create({
    inputGap: {
        marginBottom: 0,
    },
    lastInput: {
        marginBottom: 0,
    },
});
