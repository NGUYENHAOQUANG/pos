import React from 'react';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';
import { Input, InputFormat } from '@/shared/components/forms/Input';

interface SiphonLossBoxProps {
    lossAmount: string;
    onLossAmountChange: (value: string) => void;
}

export const SiphonLossBox: React.FC<SiphonLossBoxProps> = ({ lossAmount, onLossAmountChange }) => {
    return (
        <SelectionInfoBox title="Hao hụt trong ao">
            <Input
                label="Số tôm hao (kg)"
                value={lossAmount}
                onChangeText={onLossAmountChange}
                keyboardType="numeric"
                inputFormat={InputFormat.DECIMAL}
                maxDigits={20}
                required
                containerStyle={{ marginBottom: 0 }}
                maxLength={20}
            />
        </SelectionInfoBox>
    );
};
