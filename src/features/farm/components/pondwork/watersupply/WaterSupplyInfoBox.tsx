import React from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing } from '@/styles';
import { FarmInput } from '@/features/farm/components/pondwork/FarmInput';
import { PondDataBox, ResultItem } from '@/features/farm/components/pondwork/PondDataBox';

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
                    <FarmInput
                        label="Mực nước mục tiêu (cm)"
                        value={targetLevel}
                        onChangeText={onTargetLevelChange}
                        keyboardType="numeric"
                        required
                    />
                </View>

                <View style={styles.colGap} />

                <View style={styles.colInputRight}>
                    <FarmInput
                        label="Số cm cấp"
                        value={supplyLevel}
                        onChangeText={onSupplyLevelChange}
                        keyboardType="numeric"
                        required
                    />
                </View>
            </View>
        </PondDataBox>
    );
};

const styles = StyleSheet.create({
    rowInput: {
        flexDirection: 'row',
    },
    colInputLeft: {
        flex: 2,
    },
    colInputRight: {
        flex: 1.9,
    },
    colGap: {
        width: spacing.sm,
    },
});
