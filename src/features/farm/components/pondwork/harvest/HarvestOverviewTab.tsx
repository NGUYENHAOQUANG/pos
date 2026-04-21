import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Controller, Control } from 'react-hook-form';

import { useAppTheme } from '@/styles/themeContext';
import { Colors } from '@/styles/colors';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import {
    GeneralInfoBox,
    GeneralInfoBoxType,
} from '@/features/farm/components/pondwork/GeneralInfoBox';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';
import { HarvestDataBox } from '@/features/farm/components/pondwork/harvest/HarvestDataBox';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import {
    HarvestFormData,
    getHarvestTypeDisplay,
    getHarvestTypeFromDisplay,
} from '@/features/farm/schemas/harvestFormSchema';

export interface HarvestOverviewTabProps {
    control: Control<HarvestFormData>;
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
    harvestTypeOptions: string[];
    isEditMode: boolean;
    isSubmitting: boolean;
    isDirty: boolean;
    harvestTypeDisplay: string;
    onSavePress: () => void;
    onCancel: () => void;
}

export const HarvestOverviewTab: React.FC<HarvestOverviewTabProps> = ({
    control,
    selectedDate,
    setSelectedDate,
    harvestTypeOptions,
    isEditMode,
    isSubmitting,
    isDirty,
    harvestTypeDisplay,
    onSavePress,
    onCancel,
}) => {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    return (
        <>
            <SafeInputLayout contentContainerStyle={styles.scrollContent} extraScrollHeight={150}>
                <Controller
                    name="harvestType"
                    control={control}
                    render={({ field }) => (
                        <GeneralInfoBox
                            type={GeneralInfoBoxType.HARVEST}
                            date={selectedDate}
                            onDateChange={setSelectedDate}
                            activityLabel="Chọn loại thu hoạch"
                            activityOptions={harvestTypeOptions}
                            selectedActivity={getHarvestTypeDisplay(field.value)}
                            onSelectActivity={value => {
                                field.onChange(getHarvestTypeFromDisplay(value));
                            }}
                            disabledDate={true}
                        />
                    )}
                />

                <Controller
                    name="totalWeightKg"
                    control={control}
                    render={({ field: { value: yieldValue, onChange: onYieldChange } }) => (
                        <Controller
                            name="shrimpSize"
                            control={control}
                            render={({ field: { value: sizeValue, onChange: onSizeChange } }) => (
                                <Controller
                                    name="referencePrice"
                                    control={control}
                                    render={({
                                        field: { value: priceValue, onChange: onPriceChange },
                                    }) => (
                                        <HarvestDataBox
                                            yieldAmount={yieldValue || ''}
                                            onYieldAmountChange={onYieldChange}
                                            shrimpSize={sizeValue || ''}
                                            onShrimpSizeChange={onSizeChange}
                                            referencePrice={priceValue || ''}
                                            onReferencePriceChange={onPriceChange}
                                        />
                                    )}
                                />
                            )}
                        />
                    )}
                />

                <Controller
                    name="notes"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                        <SelectionNotesBox notes={value || ''} onNotesChange={onChange} />
                    )}
                />
            </SafeInputLayout>

            {/* Footer Buttons */}
            <View style={styles.footer}>
                <ButtonBarFarm
                    primaryTitle={
                        isEditMode
                            ? 'Cập nhật thông tin'
                            : harvestTypeDisplay === 'Thu hết'
                            ? 'Thu hoạch hết'
                            : 'Lưu thông tin'
                    }
                    secondaryTitle="Hủy"
                    primaryDisabled={isSubmitting || (isEditMode && !isDirty)}
                    onPrimaryPress={onSavePress}
                    onSecondaryPress={onCancel}
                />
            </View>
        </>
    );
};

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        scrollContent: {
            padding: 0,
            paddingBottom: 100,
            gap: 8,
        },
        footer: {
            backgroundColor: theme.background,
            borderTopWidth: 1,
            borderTopColor: theme.defaultBorder,
        },
    });
