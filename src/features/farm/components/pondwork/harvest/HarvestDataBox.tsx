import React, { useMemo } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Input } from '@/shared/components/forms/Input';
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

    const handleNumericInput = (text: string, callback?: (val: string) => void) => {
        if (!callback) return;

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

        // 4. Limit to 10 characters
        if (cleaned.length > 20) {
            cleaned = cleaned.substring(0, 20);
        }

        callback(cleaned);
    };

    // Build result items
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
                onChangeText={text => handleNumericInput(text, onYieldAmountChange)}
                keyboardType="numeric"
                required
                maxLength={20}
                containerStyle={styles.inputGap}
            />

            <Input
                label="Cỡ tôm (con/kg)"
                placeholder="Cỡ tôm (con/kg)"
                value={String(shrimpSize)}
                onChangeText={text => handleNumericInput(text, onShrimpSizeChange)}
                keyboardType="numeric"
                required
                maxLength={20}
                containerStyle={styles.inputGap}
            />

            <Input
                label="Giá tôm tham khảo (VNĐ/kg)"
                placeholder="Giá tôm tham khảo (VNĐ/kg)"
                value={String(referencePrice)}
                onChangeText={text => handleNumericInput(text, onReferencePriceChange)}
                keyboardType="numeric"
                required
                maxLength={20}
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
