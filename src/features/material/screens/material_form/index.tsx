import React, { useState, useMemo, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';

import { AppStackParamList } from '@/app/navigation/AppStack';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { Loading } from '@/shared/components/ui/Loading';
import { colors } from '@/styles';

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
import { MaterialForm } from '@/features/material/screens/material_form/MaterialForm';
import { MaterialFormValues } from '@/features/material/schemas/materialFormSchema';
import { showValidationError } from '@/features/material/utils/validationToast';

export const MaterialFormScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
    const route = useRoute<RouteProp<AppStackParamList, 'MaterialForm'>>();
    const queryClient = useQueryClient();

    const { setTabBarVisible } = useTabBarVisibility();

    useEffect(() => {
        setTabBarVisible(false);
        return () => setTabBarVisible(true);
    }, [setTabBarVisible]);

    const params = route.params as
        | { materialId?: string; onSave?: (data: any) => void }
        | undefined;
    const materialId = params?.materialId || null;
    const isEditMode = !!materialId;

    const { data: initialMaterial, isLoading: isLoadingDetail } = useMaterial(materialId);

    const { mutate: createMaterial, isPending: isCreating } = useCreateMaterial();
    const { mutate: updateMaterial, isPending: isUpdating } = useUpdateMaterial();
    const { mutate: deleteMaterial, isPending: isDeleting } = useDeleteMaterial();

    const { data: materialGroups = [], isLoading: isLoadingMaterialGroups } = useMaterialGroups();
    const { data: units = [] } = useUnits();

    // Local state to track which group is selected so we can query types
    const [selectedGroupId, setSelectedGroupId] = useState<string>('');

    const { data: typesByGroup = [] } = useMaterialTypesByGroup(selectedGroupId);

    // Initial Data processing
    const initialData = useMemo(() => {
        if (!isEditMode || !initialMaterial || units.length === 0) return undefined;
        return materialService.mapDetailToForm(initialMaterial, units);
    }, [isEditMode, initialMaterial, units]);

    // Group Options
    const materialGroupOptions = useMemo(() => {
        return ['Tất cả nhóm vật tư', ...materialGroups.map(g => g.name || '').filter(n => n)];
    }, [materialGroups]);

    // Unit Options
    const unitOptions = useMemo(() => {
        return units.map(u => ({ label: u.name, value: u.id }));
    }, [units]);

    // Handlers
    const handleGroupChange = (groupName: string) => {
        setSelectedGroupId(groupName);
    };

    const handleBackPress = () => {
        navigation.goBack();
    };

    const onSubmit = (formData: MaterialFormValues) => {
        if (isEditMode && initialMaterial?.id) {
            const payload = materialService.mapFormToUpdatePayload(formData);
            updateMaterial(
                { id: initialMaterial.id, request: payload },
                {
                    onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ['materials'] });
                        navigation.goBack();
                    },
                }
            );
        } else {
            const payload = materialService.mapFormToCreatePayload(formData);
            createMaterial(payload, {
                onSuccess: (response: any) => {
                    if (response?.data && params?.onSave) {
                        params.onSave(response.data);
                    }
                    queryClient.invalidateQueries({ queryKey: ['materials'] });
                    navigation.goBack();
                },
            });
        }
    };

    const onDelete = () => {
        if (isEditMode && initialMaterial?.id) {
            deleteMaterial(initialMaterial.id, {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['materials'] });
                    navigation.goBack();
                },
                onError: () => {
                    showValidationError('Xoá vật tư thất bại');
                },
            });
        }
    };

    const isSubmitting = isCreating || isUpdating || isDeleting;
    const isLoading = isSubmitting || isLoadingMaterialGroups || isLoadingDetail;

    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <Loading isLoading={isLoading}>
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
            </Loading>
        </>
    );
};
