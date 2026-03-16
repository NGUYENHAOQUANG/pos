import React from 'react';
import { ViewStyle } from 'react-native';
import { Input } from '@/shared/components/forms/Input';
import { PondDataBox, InfoItem, ResultItem } from '@/features/farm/components/pondwork/PondDataBox';

interface CurrentPondInfoBoxProps {
    shrimpBreed?: string;
    actualStockingQuantity?: number;
    shrimpSize?: string;
    onShrimpSizeChange?: (value: string) => void;
    totalEstimatedShrimp?: number;
    containerStyle?: ViewStyle;
}

export const CurrentPondInfoBox: React.FC<CurrentPondInfoBoxProps> = ({
    shrimpBreed,
    actualStockingQuantity,
    shrimpSize,
    onShrimpSizeChange,
    totalEstimatedShrimp,
    containerStyle,
}) => {
    // Calculate total estimated shrimp if not provided
    // Formula: (actualStockingQuantity * 1000) / shrimpSize
    const calculatedTotal =
        totalEstimatedShrimp !== undefined
            ? totalEstimatedShrimp
            : actualStockingQuantity && shrimpSize && parseFloat(shrimpSize) > 0
            ? Math.round((actualStockingQuantity * 1000) / parseFloat(shrimpSize))
            : 0;

    // Build info items
    const infoItems: InfoItem[] = [];
    if (shrimpBreed) {
        infoItems.push({ label: 'Tôm giống:', value: shrimpBreed });
    }
    if (actualStockingQuantity !== undefined) {
        infoItems.push({ label: 'Số lượng thả thực tế:', value: actualStockingQuantity });
    }

    // Build result items
    const resultItems: ResultItem[] = [
        { label: 'Tổng số tôm dự kiến (con)', value: calculatedTotal },
    ];

    return (
        <PondDataBox
            title="Thông tin ao hiện tại"
            infoItems={infoItems.length > 0 ? infoItems : undefined}
            resultItems={resultItems}
            containerStyle={containerStyle}
        >
            {/* Shrimp Size Input */}
            <Input
                label="Cỡ tôm (con/kg)"
                value={shrimpSize}
                onChangeText={onShrimpSizeChange}
                keyboardType="numeric"
                placeholder="0"
                required
                containerStyle={{ marginBottom: 0 }}
                disabled
            />
        </PondDataBox>
    );
};
