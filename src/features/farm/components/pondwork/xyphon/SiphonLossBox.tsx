import React from 'react';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';
import { FarmInput } from '@/features/farm/components/pondwork/FarmInput';

interface SiphonLossBoxProps {
    lossAmount: string;
    onLossAmountChange: (value: string) => void;
}

export const SiphonLossBox: React.FC<SiphonLossBoxProps> = ({ lossAmount, onLossAmountChange }) => {
    return (
        <SelectionInfoBox title="Số tôm hao (kg)">
            <FarmInput
                label="Số tôm hao (kg)"
                value={lossAmount}
                onChangeText={onLossAmountChange}
                keyboardType="numeric"
                required
            />
        </SelectionInfoBox>
    );
};
