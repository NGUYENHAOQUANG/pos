import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, StyleSheet, Platform, UIManager } from 'react-native';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DocumentPickerResponse } from '@react-native-documents/picker';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { colors, spacing, borderRadius } from '@/styles';
import {
    ExportWarehouseFormValues,
    exportWarehouseFormSchema,
} from '@/features/material/schemas/exportWarehouseFormSchema';
import { showValidationError } from '@/features/material/utils/validationToast';
import { SafeInputLayoutMaterial } from '@/shared/components/layout/SafeInputLayoutMaterial';
import { HeaderMeterial } from '@/features/material/components/HeaderMaterial';
import { ExportWarehouseFooter } from '@/features/material/components/exportwarehouse/ExportWarehouseFooter';
import { ExportWarehouseInformation } from '@/features/material/components/exportwarehouse/ExportWarehouseInformation';
import { AddWarehouseMaterial } from '@/features/material/components/warehouse/AddWarehouseMaterial';
import { IconTrashOutlined } from '@/assets/icons';
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';
import Animated from 'react-native-reanimated';
import { ConfirmSubmiss } from '@/features/material/components/warehouse/ConfirmSubmiss';
import { Input } from '@/shared/components/forms/Input';
import { FileUploader, FileUploaderRef } from '@/shared/components/forms/FileUploader';
import { DropdownOption } from '@/features/material/components/material/DropdownMaterialGroup';
import { useExportMaterialActions } from '@/features/material/hooks/logic/useExportMaterialActions';
import { useDropdownScroll, DropdownScrollContext } from '@/features/material/hooks';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface ExportWarehouseFormProps {
    isEditMode: boolean;
    initialData?: ExportWarehouseFormValues;
    creatorName?: string;
    availableMaterials: any[];
    materialOptions: DropdownOption[]; // Used for dropdown in AddWarehouseMaterial
    fileUploaderRef: React.RefObject<FileUploaderRef | null>;
    onSubmit: (data: ExportWarehouseFormValues, isDraft: boolean) => void;
    onDelete?: () => void;
    onBackPress: () => void;
}

export const ExportWarehouseForm: React.FC<ExportWarehouseFormProps> = ({
    isEditMode,
    initialData,
    creatorName,
    availableMaterials,
    materialOptions,
    fileUploaderRef,
    onSubmit,
    onDelete,
    onBackPress,
}) => {
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);

    const initializedRef = useRef(false);
    const {
        scrollRef: scrollViewRef,
        scrollToDropdown,
        scrollOffset,
        onScroll,
    } = useDropdownScroll();

    const { control, handleSubmit, reset, setValue, getValues } =
        useForm<ExportWarehouseFormValues>({
            resolver: zodResolver(exportWarehouseFormSchema),
            defaultValues: {
                date: new Date(),
                selectedZone: '',
                selectedPond: '',
                note: '',
                files: [],
                exportItems: [
                    {
                        id: Date.now().toString(),
                        materialId: '',
                        materialName: '',
                        quantity: '',
                        price: '',
                        unit: '',
                    },
                ],
            },
        });

    const watchedForm = useWatch({ control });

    useEffect(() => {
        if (initialData && !initializedRef.current) {
            reset(initialData);
            initializedRef.current = true;
        }
    }, [initialData, reset]);

    const { add, remove, update } = useExportMaterialActions(
        control,
        getValues,
        setValue,
        availableMaterials
    );

    const onError = (formErrors: any) => {
        const firstErrorKey = Object.keys(formErrors)[0];
        if (firstErrorKey) {
            let errorMsg = formErrors[firstErrorKey].message;
            if (firstErrorKey === 'exportItems' && Array.isArray(formErrors.exportItems)) {
                // Find first item error
                const itemError = formErrors.exportItems.find((e: any) => e);
                if (itemError) {
                    const fieldErrorKey = Object.keys(itemError)[0];
                    errorMsg =
                        itemError[fieldErrorKey]?.message ||
                        'Vui lòng kiểm tra lại thông tin vật tư';
                }
            }
            showValidationError(errorMsg || 'Vui lòng kiểm tra lại thông tin');
        }
    };

    const handleDropdownOpen = (index: number) => {
        scrollToDropdown({
            index,
            headerHeight: isEditMode ? 660 : 580,
            itemHeight: 280,
            fileCount: watchedForm.files?.length || 0,
            fileRowHeight: 40,
        });
    };

    // Calculate total amount from items (usually not strictly required for export, but good if UI needs it)
    const totalAmount = useMemo(() => {
        return (watchedForm.exportItems || []).reduce((sum, item) => {
            const qty = parseFloat(item.quantity || '0');
            const price = parseFloat(item.price || '0');
            return sum + qty * price;
        }, 0);
    }, [watchedForm.exportItems]);

    return (
        <View style={styles.container}>
            <HeaderMeterial
                title={isEditMode ? 'Chỉnh Sửa Phiếu Xuất Kho' : 'Tạo Phiếu Xuất Kho'}
                onBackPress={onBackPress}
                rightComponent={
                    isEditMode && onDelete ? (
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => setDeleteModalVisible(true)}
                            activeOpacity={0.7}
                        >
                            <IconTrashOutlined width={20} height={20} />
                        </TouchableOpacity>
                    ) : null
                }
            />

            <SafeInputLayoutMaterial>
                <DropdownScrollContext.Provider value={scrollOffset}>
                    <Animated.ScrollView
                        ref={scrollViewRef}
                        onScroll={onScroll}
                        scrollEventThrottle={16}
                        style={styles.contentScroll}
                        contentContainerStyle={styles.contentContainer}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <ExportWarehouseInformation
                            date={watchedForm.date ?? new Date()}
                            onDateChange={val => setValue('date', val, { shouldValidate: true })}
                            selectedZone={watchedForm.selectedZone ?? ''}
                            onZoneChange={val =>
                                setValue('selectedZone', val, { shouldValidate: true })
                            }
                            selectedPond={watchedForm.selectedPond ?? ''}
                            onPondChange={val =>
                                setValue('selectedPond', val, { shouldValidate: true })
                            }
                        >
                            {isEditMode && creatorName ? (
                                <Input
                                    label="Người tạo phiếu"
                                    value={creatorName}
                                    editable={false}
                                />
                            ) : null}

                            <Input
                                label="Ghi chú"
                                placeholder="Nhập ghi chú xuất kho"
                                value={watchedForm.note ?? ''}
                                onChangeText={val => setValue('note', val)}
                                multiline={true}
                                numberOfLines={3}
                                inputContainerStyle={{ height: 100, alignItems: 'flex-start' }}
                                inputStyle={{ textAlignVertical: 'top', paddingTop: 8 }}
                            />

                            <FileUploader
                                ref={fileUploaderRef}
                                files={(watchedForm.files as DocumentPickerResponse[]) || []}
                                onFilesSelected={newFiles => setValue('files', newFiles)}
                                maxFiles={5}
                            />
                        </ExportWarehouseInformation>

                        <AddWarehouseMaterial
                            materials={watchedForm.exportItems as any[]}
                            onUpdateMaterial={update}
                            onAddMaterial={add}
                            onRemoveMaterial={remove}
                            materialOptions={materialOptions}
                            onDropdownOpen={handleDropdownOpen}
                            title="Vật tư xuất kho"
                            isPriceDisabled={true}
                        />
                    </Animated.ScrollView>
                </DropdownScrollContext.Provider>
            </SafeInputLayoutMaterial>

            <ExportWarehouseFooter
                totalAmount={totalAmount}
                onSaveDraft={handleSubmit(data => onSubmit(data, true), onError)}
                onSubmit={() => setConfirmModalVisible(true)}
            />

            <ConfirmSubmiss
                visible={confirmModalVisible}
                onClose={() => setConfirmModalVisible(false)}
                onConfirm={() => {
                    setConfirmModalVisible(false);
                    setTimeout(() => {
                        handleSubmit(data => onSubmit(data, false), onError)();
                    }, 500);
                }}
            />

            <ConfirmationDeleteModal
                visible={deleteModalVisible}
                onConfirm={() => {
                    setDeleteModalVisible(false);
                    onDelete?.();
                }}
                onCancel={() => setDeleteModalVisible(false)}
                title="Xóa phiếu xuất kho"
                message="Bạn có chắc chắn muốn xóa phiếu xuất kho này không?"
                showSuccessToast={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundPrimary,
    },
    contentScroll: {
        flex: 1,
    },
    contentContainer: {
        paddingVertical: spacing.md,
        paddingBottom: 100,
    },
    deleteButton: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.error,
    },
});
