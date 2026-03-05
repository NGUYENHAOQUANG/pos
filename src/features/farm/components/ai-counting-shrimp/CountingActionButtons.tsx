import React from 'react';
import { AIActionButtonsWithCount } from '@/features/farm/components/ai-common/AIActionButtonsWithCount';

export interface CountingActionButtonsProps {
    countTimes: number;
    isSecondaryDisabled: boolean;
    secondaryButtonLabel: string;
    onReset: () => void;
    onSecondaryPress: () => void;
}

export const CountingActionButtons: React.FC<CountingActionButtonsProps> = ({
    countTimes,
    isSecondaryDisabled,
    secondaryButtonLabel,
    onReset,
    onSecondaryPress,
}) => (
    <AIActionButtonsWithCount
        count={countTimes}
        countLabel="Số lần đếm"
        primaryLabel="Đếm lại"
        secondaryLabel={secondaryButtonLabel}
        primaryDisabled={countTimes === 0}
        secondaryDisabled={isSecondaryDisabled}
        onPrimaryPress={onReset}
        onSecondaryPress={onSecondaryPress}
    />
);
