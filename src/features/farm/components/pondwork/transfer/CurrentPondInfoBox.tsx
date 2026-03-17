import React from 'react';
import { ViewStyle } from 'react-native';
import { Input } from '@/shared/components/forms/Input';
import { PondDataBox, InfoItem, ResultItem } from '@/features/farm/components/pondwork/PondDataBox';

interface CurrentPondInfoBoxProps {
    shrimpBreed?: string;
    shrimpSize?: string;
    onShrimpSizeChange?: (value: string) => void;
    totalEstimatedShrimp?: number;
    containerStyle?: ViewStyle;
}

export const CurrentPondInfoBox: React.FC<CurrentPondInfoBoxProps> = ({
    shrimpBreed,
    shrimpSize,
    onShrimpSizeChange,
    totalEstimatedShrimp,
    containerStyle,
}) => {
    // Build info items
    const infoItems: InfoItem[] = [];
    if (shrimpBreed) {
        infoItems.push({ label: 'Tôm giống:', value: shrimpBreed });
    }

    // Build result items
    const resultItems: ResultItem[] = [
        { label: 'Tổng số tôm dự kiến (con)', value: totalEstimatedShrimp! },
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
                placeholder="Cỡ tôm (con/kg)"
                required
                editable={false}
                containerStyle={{ marginBottom: 0 }}
                disabled
            />
        </PondDataBox>
    );
};
