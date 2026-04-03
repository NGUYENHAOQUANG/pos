import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Platform, UIManager } from 'react-native';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useAppTheme } from '@/styles/themeContext';
import { Colors, spacing } from '@/styles';
import { IMaterialType } from '@/features/material/types/material.types';
import { IMaterialGroupV2 } from '@/features/material/types/materialGroup.types';
import {
    MaterialFormValues,
    materialFormSchema,
} from '@/features/material/schemas/materialFormSchema';
import { showValidationError } from '@/features/material/utils/validationToast';
import { HeaderMeterial } from '@/features/material/components/HeaderMaterial';
import { AddMaterial } from '@/features/material/components/material_form/AddMaterial';
import { DropdownOption } from '@/features/material/components/DropdownMaterial';
import { IconTrashOutlined } from '@/assets/icons';
import { SafeInputLayoutMaterial } from '@/shared/components/layout/SafeInputLayoutMaterial';
import { ButtonBar } from '@/shared/components/layout/ButtonBar';
import { ConfirmationModalUI } from '@/shared/components/modal/ConfirmationModalUI';

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

export const MaterialForm: React.FC<MaterialFormProps> = React.memo(
    ({
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
        // ─── State & Refs ──────────────────────────────────
        const [deleteModalVisible, setDeleteModalVisible] = useState(false);
        const initializedRef = useRef(false);
        const scrollViewRef = useRef<ScrollView>(null);
        const theme = useAppTheme();
        const styles = getStyles(theme);

        // ─── Form ──────────────────────────────────────────
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

        // ─── Effects ───────────────────────────────────────
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

        // ─── Handlers ──────────────────────────────────────
        const onError = useCallback((formErrors: unknown) => {
            const errors = formErrors as Record<string, { message?: string }>;
            const firstErrorKey = Object.keys(errors)[0];
            if (firstErrorKey && errors[firstErrorKey]) {
                showValidationError(
                    errors[firstErrorKey].message || 'Vui lòng kiểm tra lại thông tin'
                );
            }
        }, []);

        const handleNameChange = useCallback(
            (val: string) => setValue('name', val, { shouldValidate: true }),
            [setValue]
        );
        const handleGroupChange = useCallback(
            (val: string) => {
                setValue('group', val, { shouldValidate: true });
                setValue('type', '');
            },
            [setValue]
        );
        const handleTypeChange = useCallback(
            (val: string) => setValue('type', val, { shouldValidate: true }),
            [setValue]
        );
        const handleUnitChange = useCallback(
            (val: string) => setValue('unit', val, { shouldValidate: true }),
            [setValue]
        );
        const handleUsageChange = useCallback(
            (val: string) => setValue('usage', val, { shouldValidate: true }),
            [setValue]
        );
        const handleManufacturerChange = useCallback(
            (val: string) => setValue('manufacturer', val, { shouldValidate: true }),
            [setValue]
        );
        const handleUnitDropdownOpen = useCallback(() => {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }, []);

        const handleDeletePress = useCallback(() => setDeleteModalVisible(true), []);
        const handleConfirmDelete = useCallback(() => {
            setDeleteModalVisible(false);
            onDelete?.();
        }, [onDelete]);
        const handleCancelDelete = useCallback(() => setDeleteModalVisible(false), []);

        // ─── Render ────────────────────────────────────────
        return (
            <View style={styles.container}>
                <HeaderMeterial
                    title={isEditMode ? 'Sửa Thông Tin Vật Tư' : 'Tạo Vật Tư'}
                    onBackPress={onBackPress}
                    rightIcon={
                        isEditMode && onDelete ? (
                            <IconTrashOutlined width={20} height={20} color={theme.text} />
                        ) : undefined
                    }
                    onRightPress={isEditMode && onDelete ? handleDeletePress : undefined}
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
                            onNameChange={handleNameChange}
                            group={watchedForm.group}
                            onGroupChange={handleGroupChange}
                            type={watchedForm.type}
                            onTypeChange={handleTypeChange}
                            unit={watchedForm.unit}
                            onUnitChange={handleUnitChange}
                            unitOptions={unitOptions}
                            groupOptions={groupOptions}
                            materialGroupsData={materialGroupsData}
                            groupDisabled={groupDisabled}
                            typesByGroup={typesByGroup}
                            usage={watchedForm.usage}
                            onUsageChange={handleUsageChange}
                            manufacturer={watchedForm.manufacturer}
                            onManufacturerChange={handleManufacturerChange}
                            onUnitDropdownOpen={handleUnitDropdownOpen}
                        />
                    </ScrollView>
                </SafeInputLayoutMaterial>

                <ButtonBar
                    mode="double"
                    primaryTitle="Lưu thông tin"
                    secondaryTitle="Huỷ"
                    containerStyle={styles.buttonBarBorder}
                    onPrimaryPress={handleSubmit(onSubmit, onError)}
                    onSecondaryPress={onBackPress}
                    primaryButtonDisabled={isSubmitting}
                    primaryButtonLoading={isSubmitting}
                    secondaryButtonDisabled={isSubmitting}
                />

                <ConfirmationModalUI
                    visible={deleteModalVisible}
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                    title="Xóa vật tư​"
                    message="Bạn có chắc chắn muốn xóa vật tư này không?"
                    showSuccessToast={false}
                />
            </View>
        );
    }
);

const getStyles = (theme: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.backgroundPrimary,
        },
        contentScroll: {
            flex: 1,
        },
        contentContainer: {
            paddingBottom: 100,
            gap: spacing.sm,
        },
        buttonBarBorder: {
            borderTopWidth: 1,
            borderTopColor: theme.border,
        },
    });
