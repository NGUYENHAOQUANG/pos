import React from 'react';
import { View, StyleSheet } from 'react-native';

import { colors, spacing } from '@/styles';
import { BreedOption, PondData } from '@/features/farm/types/farm.types';

import { Control } from 'react-hook-form';
import { CreateCycleFormValues } from '@/features/farm/schemas/createCycleSchema';

import BreedAndSeasonSection from '@/features/farm/components/create-cycle/BreedAndSeasonSection';
import StockingInfoSection from '@/features/farm/components/create-cycle/StockingInfoSection';
import CreateCycleNotesSection from '@/features/farm/components/create-cycle/CreateCycleNotesSection';

interface Props {
    control: Control<CreateCycleFormValues>;
    pondId?: string;
    pond?: PondData; // Must be typed
    isEdit?: boolean;
    breedOptions: BreedOption[];
    seasonOptions: { label: string; value: string }[];
    onPressCountingShrimp?: () => void;
}

const CreateCycleForm: React.FC<Props> = ({
    control,
    pondId,
    pond,
    isEdit = false,
    breedOptions,
    seasonOptions,
    onPressCountingShrimp,
}) => {
    return (
        <View style={styles.container}>
            <BreedAndSeasonSection
                control={control}
                breedOptions={breedOptions}
                seasonOptions={seasonOptions}
                isEdit={isEdit}
            />

            <StockingInfoSection
                control={control}
                pondId={pondId}
                pond={pond}
                breedOptions={breedOptions}
                isEdit={isEdit}
                onPressCountingShrimp={onPressCountingShrimp}
            />

            <CreateCycleNotesSection control={control} />
        </View>
    );
};

export default CreateCycleForm;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
        gap: spacing.sm,
    },
});
