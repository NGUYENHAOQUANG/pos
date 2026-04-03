import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { StatusBar } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';

import { AppStackParamList } from '@/app/navigation/AppStack';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { useAppTheme } from '@/styles/themeContext';
import { useFarmStore } from '@/features/farm/store/farmStore';
import {
    useCreateMaterial,
    useUpdateMaterial,
    useDeleteMaterial,
    useMaterialGroups,
    useUnits,
    useMaterialTypesByGroup,
    useMaterial,
} from '@/features/material/hooks';
import { materialService } from '@/features/material/services/materialService';
import { MaterialFormValues } from '@/features/material/schemas/materialFormSchema';
import { showValidationError } from '@/features/material/utils/validationToast';
import { MaterialForm } from '@/features/material/screens/material_form/MaterialFormContent';

export const MaterialFormScreen: React.FC = () => {
    // ─── Navigation & Route ────────────────────────────────
    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
    const route = useRoute<RouteProp<AppStackParamList, 'MaterialForm'>>();
    const queryClient = useQueryClient();
    const theme = useAppTheme();

    const params = route.params as { materialId?: string };
    const materialId = params?.materialId || null;
    const isEditMode = !!materialId;

    // ─── Tab Bar ───────────────────────────────────────────
    const { setTabBarVisible } = useTabBarVisibility();

    useEffect(() => {
        setTabBarVisible(false);
        return () => setTabBarVisible(true);
    }, [setTabBarVisible]);

    // ─── Store ─────────────────────────────────────────────
    const currentWarehouseId = useFarmStore(state => state.currentWarehouseId);

    // ─── Queries ───────────────────────────────────────────
    const { data: initialMaterial } = useMaterial(materialId);
    const { data: materialGroups = [], isLoading: isLoadingMaterialGroups } = useMaterialGroups();
    const { data: units = [] } = useUnits();

    const [selectedGroupId, setSelectedGroupId] = useState<string>('');
    const { data: typesByGroup = [] } = useMaterialTypesByGroup(selectedGroupId);

    // ─── Mutations ─────────────────────────────────────────
    const { mutate: createMaterial, isPending: isCreating } = useCreateMaterial();
    const { mutate: updateMaterial, isPending: isUpdating } = useUpdateMaterial();
    const { mutate: deleteMaterial, isPending: isDeleting } = useDeleteMaterial();

    const isSubmitting = isCreating || isUpdating || isDeleting;

    // ─── Derived ───────────────────────────────────────────
    const initialData = useMemo(() => {
        if (!isEditMode || !initialMaterial || units.length === 0) return undefined;
        return materialService.mapDetailToForm(initialMaterial, units);
    }, [isEditMode, initialMaterial, units]);

    const materialGroupOptions = useMemo(
        () => ['Tất cả nhóm vật tư', ...materialGroups.map(g => g.name || '').filter(n => n)],
        [materialGroups]
    );

    const unitOptions = useMemo(() => units.map(u => ({ label: u.name, value: u.id })), [units]);

    // ─── Handlers ──────────────────────────────────────────
    const handleGroupChange = useCallback((groupName: string) => {
        setSelectedGroupId(groupName);
    }, []);

    const handleBackPress = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const handleSuccess = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ['materials'] });
        navigation.goBack();
    }, [queryClient, navigation]);

    const onSubmit = useCallback(
        (formData: MaterialFormValues) => {
            if (isEditMode && initialMaterial?.id) {
                const payload = materialService.mapFormToUpdatePayload(formData);
                updateMaterial(
                    { id: initialMaterial.id, request: payload },
                    { onSuccess: handleSuccess }
                );
            } else {
                const payload = materialService.mapFormToCreatePayload(
                    formData,
                    currentWarehouseId ?? ''
                );
                createMaterial(payload, { onSuccess: handleSuccess });
            }
        },
        [
            isEditMode,
            currentWarehouseId,
            initialMaterial,
            updateMaterial,
            createMaterial,
            handleSuccess,
        ]
    );

    const onDelete = useCallback(() => {
        if (isEditMode && initialMaterial?.id) {
            deleteMaterial(initialMaterial.id, {
                onSuccess: handleSuccess,
                onError: () => showValidationError('Xoá vật tư thất bại'),
            });
        }
    }, [isEditMode, initialMaterial, deleteMaterial, handleSuccess]);

    // ─── Render ────────────────────────────────────────────
    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
            <MaterialForm
                isEditMode={isEditMode}
                isSubmitting={isSubmitting}
                initialData={initialData}
                groupOptions={materialGroupOptions}
                unitOptions={unitOptions}
                typesByGroup={typesByGroup}
                materialGroupsData={materialGroups}
                groupDisabled={isLoadingMaterialGroups}
                onGroupChangeTrigger={handleGroupChange}
                onSubmit={onSubmit}
                onDelete={onDelete}
                onBackPress={handleBackPress}
            />
        </>
    );
};
