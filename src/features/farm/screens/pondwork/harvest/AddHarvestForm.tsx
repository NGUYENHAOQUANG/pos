import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { colors, spacing, borderRadius } from '@/styles';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import { GeneralInfoBox } from '@/features/farm/components/pondwork/GeneralInfoBox';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';
import { HarvestDataBox } from '@/features/farm/components/pondwork/harvest/HarvestDataBox';
import { ConfirmationModal } from '@/shared/components/modal/ConfirmationModal';
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';
import { DeleteButton } from '@/shared/components/buttons/DeleteButton';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import {
    HarvestFormData,
    harvestFormSchema,
    getHarvestTypeDisplay,
    getHarvestTypeFromDisplay,
} from '@/features/farm/schemas/harvestFormSchema';

export interface AddHarvestFormProps {
    initialData: HarvestFormData;
    initialDate: Date;
    isEditMode: boolean;
    isSubmitting: boolean;
    onSubmitForm: (data: HarvestFormData) => void;
    onDelete?: () => void;
    onBack: () => void;
    onCancel: () => void;
}

export const AddHarvestForm: React.FC<AddHarvestFormProps> = ({
    initialData,
    initialDate,
    isEditMode,
    isSubmitting,
    onSubmitForm,
    onDelete,
    onBack,
    onCancel,
}) => {
    const insets = useSafeAreaInsets();

    const { control, handleSubmit, watch, reset } = useForm<HarvestFormData>({
        resolver: zodResolver(harvestFormSchema),
        defaultValues: initialData,
    });

    // Reset form when initialData changes (useful when detail query is fetched)
    useEffect(() => {
        reset(initialData);
    }, [initialData, reset]);

    const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
    const [isConfirmationModalVisible, setIsConfirmationModalVisible] = useState(false);
    const [confirmationModalType, setConfirmationModalType] = useState<'harvest_full' | null>(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    const watchedHarvestType = watch('harvestType');
    const harvestTypeDisplay = getHarvestTypeDisplay(watchedHarvestType);
    const harvestTypeOptions = ['Thu hết', 'Thu tỉa'];

    const handleSavePress = () => {
        if (harvestTypeDisplay === 'Thu hết' && !isEditMode) {
            setConfirmationModalType('harvest_full');
            setIsConfirmationModalVisible(true);
        } else {
            handleSubmit(onSubmitForm)();
        }
    };

    const handleConfirmSave = () => {
        setIsConfirmationModalVisible(false);
        setConfirmationModalType(null);
        handleSubmit(onSubmitForm)();
    };

    const handleCancelConfirmation = () => {
        setIsConfirmationModalVisible(false);
        setConfirmationModalType(null);
    };

    const handleDeletePress = () => {
        setDeleteModalVisible(true);
    };

    const handleConfirmDelete = () => {
        setDeleteModalVisible(false);
        onDelete?.();
    };

    const handleCancelDelete = () => {
        setDeleteModalVisible(false);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thu hoạch</Text>
                {isEditMode ? (
                    <DeleteButton onPress={handleDeletePress} />
                ) : (
                    <View style={styles.headerSpacer} />
                )}
            </View>

            {/* Content */}
            <SafeInputLayout contentContainerStyle={styles.scrollContent} extraScrollHeight={150}>
                <Controller
                    name="harvestType"
                    control={control}
                    render={({ field }) => (
                        <GeneralInfoBox
                            type="harvest"
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
                    secondaryTitle="Huỷ"
                    primaryDisabled={isSubmitting}
                    onPrimaryPress={handleSavePress}
                    onSecondaryPress={onCancel}
                />
            </View>

            {/* Confirmation Modal */}
            {confirmationModalType && (
                <ConfirmationModal
                    visible={isConfirmationModalVisible}
                    onConfirm={handleConfirmSave}
                    onCancel={handleCancelConfirmation}
                    type={confirmationModalType}
                />
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmationDeleteModal
                visible={deleteModalVisible}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 12,
        paddingHorizontal: spacing.md,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        textAlign: 'center',
    },
    headerSpacer: {
        width: 40,
    },
    scrollContent: {
        padding: 0,
        paddingBottom: 100,
    },
    footer: {
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
});
