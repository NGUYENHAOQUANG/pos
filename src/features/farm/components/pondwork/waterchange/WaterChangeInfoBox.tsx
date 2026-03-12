import React from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing } from '@/styles';
import { PondDataBox, ResultItem } from '@/features/farm/components/pondwork/PondDataBox';
import { Input, InputFormat } from '@/shared/components/forms/Input';

interface WaterSupplyInfoBoxProps {
    targetLevel: string;
    onTargetLevelChange: (val: string) => void;
    supplyLevel: string;
    onSupplyLevelChange: (val: string) => void;
    drainLevel?: string | number;
    volumeAfterDrain?: string | number;
    volumeSupply?: string | number;
    volumeAfterSupply?: string | number;
}

export const WaterSupplyInfoBox: React.FC<WaterSupplyInfoBoxProps> = ({
    targetLevel,
    onTargetLevelChange,
    supplyLevel,
    onSupplyLevelChange,
    drainLevel = '-',
    volumeAfterDrain = '-',
    volumeSupply = '-',
    volumeAfterSupply = '-',
}) => {
    const resultItems: ResultItem[] = [
        { label: 'Mực nước xả xuống (cm)', value: drainLevel },
        { label: 'Thể tích sau xả (m³)', value: volumeAfterDrain },
        { label: 'Thể tích nước cấp vào (m³)', value: volumeSupply },
        { label: 'Thể tích nước sau cấp (m³)', value: volumeAfterSupply },
    ];

    return (
        <PondDataBox title="Mực nước và thể tích" resultItems={resultItems}>
            <View style={styles.rowInput}>
                <View style={styles.colInputLeft}>
                    <Input
                        label="Mực nước mục tiêu (cm)"
                        placeholder="Mực nước mục tiêu (cm)"
                        value={targetLevel}
                        onChangeText={onTargetLevelChange}
                        keyboardType="numeric"
                        inputFormat={InputFormat.DECIMAL}
                        maxDigits={10}
                        required
                        containerStyle={{ marginBottom: 0 }}
                    />
                </View>

                <View style={styles.colGap} />

                <View style={styles.colInputRight}>
                    <Input
                        label="Số cm cấp"
                        placeholder="Số cm cấp"
                        value={supplyLevel}
                        onChangeText={onSupplyLevelChange}
                        keyboardType="numeric"
                        inputFormat={InputFormat.DECIMAL}
                        maxDigits={10}
                        required
                        containerStyle={{ marginBottom: 0 }}
                    />
                </View>
            </View>
        </PondDataBox>
    );
};

const styles = StyleSheet.create({
    rowInput: {
        flexDirection: 'column',
        gap: spacing.sm,
    },
    colInputLeft: {
        flex: 1,
    },
    colInputRight: {
        flex: 1,
    },
    colGap: {
        height: 0,
    },
});
