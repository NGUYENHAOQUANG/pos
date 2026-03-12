import React from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing } from '@/styles';
import { PondDataBox, ResultItem } from '@/features/farm/components/pondwork/PondDataBox';
import { Input } from '@/shared/components/forms/Input';

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
        if (cleaned.length > 20) {
            cleaned = cleaned.slice(0, 20);
        }

        callback(cleaned);
    };

    return (
        <PondDataBox title="Mực nước và thể tích" resultItems={resultItems}>
            <View style={styles.rowInput}>
                <View style={styles.colInputLeft}>
                    <Input
                        label="Mực nước mục tiêu (cm)"
                        placeholder="Mực nước mục tiêu (cm)"
                        value={targetLevel}
                        onChangeText={text => handleNumericInput(text, onTargetLevelChange)}
                        keyboardType="numeric"
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
                        onChangeText={text => handleNumericInput(text, onSupplyLevelChange)}
                        keyboardType="numeric"
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
