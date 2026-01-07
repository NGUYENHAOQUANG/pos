import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { spacing } from '@/styles';
import { FarmInput } from '@/features/farm/components/pondwork/FarmInput';
import { PondDataBox, ResultItem } from '@/features/farm/components/pondwork/PondDataBox';

interface HarvestDataBoxProps {
    yieldAmount?: string; // Sản lượng (kg)
    onYieldAmountChange?: (value: string) => void;
    shrimpSize?: string; // Cỡ tôm (con/kg)
    onShrimpSizeChange?: (value: string) => void;
    referencePrice?: string; // Giá tôm tham khảo (VNĐ/kg)
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
        const yieldValue = parseFloat(yieldAmount.replace(/\D/g, '')) || 0;
        const price = parseFloat(referencePrice.replace(/\D/g, '')) || 0;
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
            {/* First Row: Sản lượng và Cỡ tôm */}
            <View style={styles.row}>
                {/* Sản lượng (kg) */}
                <View style={[styles.col, { paddingRight: spacing.xs }]}>
                    <FarmInput
                        label="Sản lượng (kg)"
                        value={yieldAmount}
                        onChangeText={text => handleNumericInput(text, onYieldAmountChange)}
                        keyboardType="numeric"
                        required
                    />
                </View>

                {/* Cỡ tôm (con/kg) */}
                <View style={[styles.col, { paddingLeft: spacing.xs }]}>
                    <FarmInput
                        label="Cỡ tôm (con/kg)"
                        value={shrimpSize}
                        onChangeText={text => handleNumericInput(text, onShrimpSizeChange)}
                        keyboardType="numeric"
                        required
                    />
                </View>
            </View>

            {/* Second Row: Giá tôm tham khảo */}
            <FarmInput
                label="Giá tôm tham khảo (VNĐ/kg)"
                value={referencePrice}
                onChangeText={text => handleNumericInput(text, onReferencePriceChange)}
                keyboardType="numeric"
                required
            />
        </PondDataBox>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
    },
    col: {
        flex: 1,
    },
});
