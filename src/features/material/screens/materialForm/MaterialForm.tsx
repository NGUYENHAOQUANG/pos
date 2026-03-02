import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, UIManager } from 'react-native';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { DropdownOption } from '@/features/material/components/DropdownMaterial';
import { colors, spacing, borderRadius } from '@/styles';
import { IMaterialType } from '@/features/material/types/material.types';
import { IMaterialGroupV2 } from '@/features/material/types/materialGroup.types';
import {
    MaterialFormValues,
    materialFormSchema,
} from '@/features/material/schemas/materialFormSchema';
import { showValidationError } from '@/features/material/utils/validationToast';
import { SafeInputLayoutMaterial } from '@/shared/components/layout/SafeInputLayoutMaterial';
import { HeaderMeterial } from '@/features/material/components/HeaderMaterial';
import { ButtonBar } from '@/shared/components/layout/ButtonBar';
import { IconTrashOutlined } from '@/assets/icons';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { ConfirmationDeleteModal } from '@/shared/components/modal/ConfirmationDeleteModal';
import { AddMaterial } from '@/features/material/components/materialForm/AddMaterial';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface MaterialFormProps {
    isEditMode: boolean;
    isSubmitting: boolean;
    initialData?: MaterialFormValues;
    groupOptions?: string[];
    unitOptions?: DropdownOption[];
    materialGroupsData?: IMaterialGroupV2[];
    typesByGroup?: IMaterialType[];
    groupDisabled?: boolean;
    onSubmit: (data: MaterialFormValues) => void;
    onDelete?: () => void;
    onBackPress: () => void;
    onGroupChangeTrigger: (groupName: string) => void;
}

export const MaterialForm: React.FC<MaterialFormProps> = ({
    isEditMode,
    isSubmitting,
    initialData,
    groupOptions = [],
    unitOptions = [],
    materialGroupsData = [],
    typesByGroup = [],
    groupDisabled = false,
    onSubmit,
    onDelete,
    onBackPress,
    onGroupChangeTrigger,
}) => {
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const initializedRef = useRef(false);
    const scrollViewRef = useRef<ScrollView>(null);

    const { control, handleSubmit, reset, setValue } = useForm<MaterialFormValues>({
        resolver: zodResolver(materialFormSchema),
        defaultValues: {
            name: '',
            group: '',
            type: '',
            unit: '',
            usage: '',
            manufacturer: '',
            isActive: true,
        },
    });

    const watchedForm = useWatch({ control });

    useEffect(() => {
        if (watchedForm.group) {
            onGroupChangeTrigger(watchedForm.group);
        }
    }, [watchedForm.group, onGroupChangeTrigger]);

    useEffect(() => {
        if (initialData && !initializedRef.current) {
            reset(initialData);
            initializedRef.current = true;
        }
    }, [initialData, reset]);

    const onError = (formErrors: any) => {
        const firstErrorKey = Object.keys(formErrors)[0];
        if (firstErrorKey) {
            showValidationError(
                formErrors[firstErrorKey].message || 'Vui lòng kiểm tra lại thông tin'
            );
        }
    };

    return (
        <View style={styles.container}>
            <HeaderMeterial
                title={isEditMode ? 'Sửa Thông Tin Vật Tư' : 'Tạo Vật Tư'}
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
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.contentScroll}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <AddMaterial
                        name={watchedForm.name}
                        onNameChange={val => setValue('name', val, { shouldValidate: true })}
                        group={watchedForm.group}
                        onGroupChange={val => {
                            setValue('group', val, { shouldValidate: true });
                            setValue('type', '');
                        }}
                        type={watchedForm.type}
                        onTypeChange={val => setValue('type', val, { shouldValidate: true })}
                        unit={watchedForm.unit}
                        onUnitChange={val => setValue('unit', val, { shouldValidate: true })}
                        unitOptions={unitOptions}
                        groupOptions={groupOptions}
                        materialGroupsData={materialGroupsData}
                        groupDisabled={groupDisabled}
                        typesByGroup={typesByGroup}
                        usage={watchedForm.usage}
                        onUsageChange={val => setValue('usage', val, { shouldValidate: true })}
                        manufacturer={watchedForm.manufacturer}
                        onManufacturerChange={val =>
                            setValue('manufacturer', val, { shouldValidate: true })
                        }
                        isActive={watchedForm.isActive ?? true}
                        onIsActiveChange={val => setValue('isActive', val)}
                        onUnitDropdownOpen={() => {
                            setTimeout(() => {
                                scrollViewRef.current?.scrollToEnd({ animated: true });
                            }, 100);
                        }}
                    />
                </ScrollView>
            </SafeInputLayoutMaterial>

            <ButtonBar
                mode="double"
                primaryTitle="Lưu thông tin"
                secondaryTitle="Huỷ"
                containerStyle={{
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                }}
                onPrimaryPress={handleSubmit(onSubmit, onError)}
                onSecondaryPress={onBackPress}
                primaryButtonDisabled={isSubmitting}
            />

            <ConfirmationDeleteModal
                visible={deleteModalVisible}
                onConfirm={() => {
                    setDeleteModalVisible(false);
                    onDelete?.();
                }}
                onCancel={() => setDeleteModalVisible(false)}
                title="Xóa vật tư"
                message="Bạn có chắc chắn muốn xóa vật tư này không?"
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
