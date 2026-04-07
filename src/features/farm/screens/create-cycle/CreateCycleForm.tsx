import React from 'react';
import { View, StyleSheet } from 'react-native';

import { spacing } from '@/styles';
import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { BreedOption, PondData } from '@/features/farm/types/farm.types';

import { Control, Controller, useWatch } from 'react-hook-form';
import { CreateCycleFormValues } from '@/features/farm/schemas/createCycleSchema';

import BreedAndSeasonSection from '@/features/farm/components/create-cycle/BreedAndSeasonSection';
import StockingInfoSection from '@/features/farm/components/create-cycle/StockingInfoSection';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';

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
    const activeNotes = useWatch({ control, name: 'notes' });
    const theme = useAppTheme();
    const styles = getStyles(theme);

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

            <Controller
                control={control}
                name="notes"
                render={({ field: { onChange } }) => (
                    <SelectionNotesBox notes={activeNotes || ''} onNotesChange={onChange} />
                )}
            />
        </View>
    );
};

export default CreateCycleForm;

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundPrimary,
            gap: spacing.sm,
        },
    });
