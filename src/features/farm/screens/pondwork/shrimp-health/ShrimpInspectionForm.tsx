import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';

import { colors } from '@/styles';
import { ButtonBarFarm } from '@/features/farm/components/ButtonBarFarm';
import {
    GeneralInfoBox,
    GeneralInfoBoxRef,
} from '@/features/farm/components/pondwork/GeneralInfoBox';
import { ShrimpInspectionFoodCheckBox } from '@/features/farm/components/pondwork/shrimp-inspection/ShrimpInspectionFoodCheckBox';
import {
    ShrimpInspectionObservationBox,
    AIHealthCheckResult,
} from '@/features/farm/components/pondwork/shrimp-inspection/ShrimpInspectionObservationBox';
import { SelectionNotesBox } from '@/features/farm/components/SelectionNotesBox';
import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';
import { DeleteButton } from '@/shared/components/buttons/DeleteButton';
import { ShrimpInspectionMeta, JobExecution } from '@/features/farm/types/farm.types';
import { SafeInputLayout } from '@/shared/components/layout/SafeInputLayout';
import { Loading } from '@/shared/components/ui/Loading';
import { ShrimpInspectionFormValues } from '@/features/farm/schemas/shrimpInspectionSchema';
import { HeaderSection } from '@/shared/components/layout/HeaderSection';

interface Props {
    itemToEdit?: JobExecution;
    meta: ShrimpInspectionMeta;
    selectedDate: Date;
    onSelectedDateChange: (date: Date) => void;
    values: ShrimpInspectionFormValues;
    onChange: (patch: Partial<ShrimpInspectionFormValues>) => void;
    aiResult: AIHealthCheckResult | null;
    isSaving: boolean;
    isDeleteModalVisible: boolean;
    onBack: () => void;
    onDeletePress: () => void;
    onConfirmDelete: () => void;
    onCancelDelete: () => void;
    onAICheckPress: () => void;
    onSubmit: (documentIds: string[]) => void;
    primaryDisabled: boolean;
}

export const ShrimpInspectionForm: React.FC<Props> = ({
    itemToEdit,
    meta,
    selectedDate,
    onSelectedDateChange,
    values,
    onChange,
    aiResult,
    isSaving,
    isDeleteModalVisible,
    onBack,
    onDeletePress,
    onConfirmDelete,
    onCancelDelete,
    onAICheckPress,
    onSubmit,
    primaryDisabled,
}) => {
    const generalInfoBoxRef = useRef<GeneralInfoBoxRef>(null);

    const handleSavePress = () => {
        const documentIds = generalInfoBoxRef.current?.getUploadedIds() || [];
        onSubmit(documentIds);
        generalInfoBoxRef.current?.markAsSaved();
    };

    return (
        <Loading isLoading={isSaving}>
            <View style={styles.container}>
                <HeaderSection
                    title="Kiểm tra tôm"
                    onBack={onBack}
                    rightComponent={
                        itemToEdit ? <DeleteButton onPress={onDeletePress} /> : undefined
                    }
                    containerStyle={styles.headerContainer}
                />

                <SafeInputLayout
                    contentContainerStyle={styles.scrollContent}
                    extraScrollHeight={100}
                >
                    <GeneralInfoBox
                        ref={generalInfoBoxRef}
                        date={selectedDate}
                        onDateChange={onSelectedDateChange}
                        type="withImage"
                        imageUris={values.images || []}
                        onImagesChange={uris => onChange({ images: uris })}
                        documentIds={meta.documentIds}
                        disabledDate={true}
                    />

                    <ShrimpInspectionFoodCheckBox
                        foodAmount={values.foodAmount || ''}
                        onFoodAmountChange={val => onChange({ foodAmount: val })}
                        leftoverFood={values.leftoverFood || 'Hết'}
                        onLeftoverFoodChange={val => onChange({ leftoverFood: val })}
                    />

                    <ShrimpInspectionObservationBox
                        intestine={values.intestine || 'Đầy'}
                        onIntestineChange={val => onChange({ intestine: val })}
                        intestineColor={values.intestineColor || 'Màu thức ăn'}
                        onIntestineColorChange={val => onChange({ intestineColor: val })}
                        stoolColor={values.stoolColor || 'Màu thức ăn'}
                        onStoolColorChange={val => onChange({ stoolColor: val })}
                        liver={values.liver || 'Bình thường'}
                        onLiverChange={val => onChange({ liver: val })}
                        onAICheckPress={onAICheckPress}
                        aiResult={aiResult}
                    />

                    <SelectionNotesBox
                        notes={values.notes || ''}
                        onNotesChange={val => onChange({ notes: val })}
                    />
                </SafeInputLayout>

                <View style={styles.footer}>
                    <ButtonBarFarm
                        primaryTitle={itemToEdit ? 'Cập nhật thông tin' : 'Lưu thông tin'}
                        secondaryTitle="Huỷ"
                        onPrimaryPress={handleSavePress}
                        onSecondaryPress={onBack}
                        primaryDisabled={itemToEdit ? primaryDisabled : false}
                    />
                </View>

                <ConfirmationModalUI
                    visible={isDeleteModalVisible}
                    onConfirm={onConfirmDelete}
                    onCancel={onCancelDelete}
                    successMessage="Đã xoá kiểm tra tôm"
                    showSuccessToast={false}
                />
            </View>
        </Loading>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    headerContainer: {
        backgroundColor: colors.backgroundPrimary,
    },
    scrollContent: {
        paddingBottom: 100,
        gap: 8,
    },
    footer: {
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
});
