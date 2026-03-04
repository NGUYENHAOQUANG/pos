import React from 'react';
import { SelectionInfoBox } from '@/features/farm/components/pondwork/SelectionInfoBox';
import { Input } from '@/shared/components/forms/Input';

interface SiphonLossBoxProps {
    lossAmount: string;
    onLossAmountChange: (value: string) => void;
}

export const SiphonLossBox: React.FC<SiphonLossBoxProps> = ({ lossAmount, onLossAmountChange }) => {
    const handleNumericInput = (text: string, callback: (val: string) => void) => {
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

    return (
        <SelectionInfoBox title="Hao hụt trong ao">
            <Input
                label="Số tôm hao (kg)"
                value={lossAmount}
                onChangeText={text => handleNumericInput(text, onLossAmountChange)}
                keyboardType="numeric"
                required
                containerStyle={{ marginBottom: 0 }}
            />
        </SelectionInfoBox>
    );
};
