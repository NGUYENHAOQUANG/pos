import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { colors } from '@/styles';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import { GeneralInfoBox } from '@/features/farm/components/pondwork/GeneralInfoBox';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';
import { HarvestDataBox } from '@/features/farm/components/pondwork/harvest/HarvestDataBox';

import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';
import { DeleteButton } from '@/shared/components/buttons/DeleteButton';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import {
    HarvestFormData,
    harvestFormSchema,
    getHarvestTypeDisplay,
    getHarvestTypeFromDisplay,
} from '@/features/farm/schemas/harvestFormSchema';
import { handleHarvestFormError } from '@/features/farm/utils/toastMessages';

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
    const {
        control,
        handleSubmit,
        watch,
        reset,
        formState: { isDirty },
    } = useForm<HarvestFormData>({
        resolver: zodResolver(harvestFormSchema),
        defaultValues: initialData,
    });

    // Reset form when initialData changes (useful when detail query is fetched)
    useEffect(() => {
        reset(initialData);
    }, [initialData, reset]);

    const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
    const [isConfirmationModalVisible, setIsConfirmationModalVisible] = useState(false);

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    const watchedHarvestType = watch('harvestType');
    const harvestTypeDisplay = getHarvestTypeDisplay(watchedHarvestType);
    const harvestTypeOptions = ['Thu hết', 'Thu tỉa'];

    const handleSavePress = () => {
        if (harvestTypeDisplay === 'Thu hết' && !isEditMode) {
            // Validate first, then show confirmation modal
            handleSubmit(() => {
                setIsConfirmationModalVisible(true);
            }, handleHarvestFormError)();
        } else {
            handleSubmit(onSubmitForm, handleHarvestFormError)();
        }
    };

    const handleConfirmSave = () => {
        setIsConfirmationModalVisible(false);
        handleSubmit(onSubmitForm, handleHarvestFormError)();
    };

    const handleCancelConfirmation = () => {
        setIsConfirmationModalVisible(false);
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
            <HeaderSection
                title="Thu hoạch"
                onBack={onBack}
                rightComponent={
                    isEditMode ? <DeleteButton onPress={handleDeletePress} /> : undefined
                }
            />

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
                    primaryDisabled={isSubmitting || (isEditMode && !isDirty)}
                    onPrimaryPress={handleSavePress}
                    onSecondaryPress={onCancel}
                />
            </View>

            {/* Confirmation Modal for full harvest */}
            <ConfirmationModalUI
                visible={isConfirmationModalVisible}
                onConfirm={handleConfirmSave}
                onCancel={handleCancelConfirmation}
                title="Xác nhận thu hoạch hết"
                message={`Việc thu hoạch hết sẽ kết thúc chu kỳ nuôi hiện tại và không thể hoàn tác.\nBạn có chắc chắn muốn thu hoạch hết không?`}
                confirmText="Thu hết"
                cancelText="Không"
                showSuccessToast={false}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModalUI
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
    scrollContent: {
        padding: 0,
        paddingBottom: 100,
        gap: 8,
    },
    footer: {
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
});
