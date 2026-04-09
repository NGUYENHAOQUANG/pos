import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { AppStackParamList } from '@/app/navigation/AppStack';

import {
    useCreateWaterTreatment,
    useUpdateWaterTreatment,
    useDeleteWaterTreatment,
    useWaterTreatmentDetail,
} from '@/features/farm/hooks/useWaterTreatmentRecords';
import { useFarmMaterials } from '@/features/farm/hooks/useFarmMaterials';
import { waterTreatmentService } from '@/features/farm/services/pond-work/water-treatment.service';
import { WaterTreatmentForm } from './WaterTreatmentForm';

type ScreenRouteProp = RouteProp<AppStackParamList, 'WaterTreatmentScreen'>;
type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

export const WaterTreatmentScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { pondId, jobId } = route.params || {};
    const { setTabBarVisible } = useTabBarVisibility();

    const isEditing = !!jobId;

    // Hide tab bar
    useEffect(() => {
        setTabBarVisible(false);
    }, [setTabBarVisible]);

    // Mutations
    const createMutation = useCreateWaterTreatment();
    const updateMutation = useUpdateWaterTreatment();
    const deleteMutation = useDeleteWaterTreatment();
    const isSavingActively =
        createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

    // Data fetching
    const { materials, isLoading: materialsLoading } = useFarmMaterials();
    const { data: detailResponse, isLoading: isLoadingDetail } = useWaterTreatmentDetail(
        isEditing ? pondId : undefined,
        isEditing ? jobId : undefined
    );
    const detailData = detailResponse?.data || null;

    // Minimum visual loading time to prevent skeleton flashing
    const [initialLoading, setInitialLoading] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => setInitialLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    const isInitializing = initialLoading || materialsLoading || (isEditing && isLoadingDetail);

    // Derived Initial Values
    const { initialValues, initialSnapshot } = useMemo(() => {
        if (!isEditing || !detailData) {
            const def = waterTreatmentService.createDefaultFormValues();
            return { initialValues: def, initialSnapshot: null };
        }

        const mapped = waterTreatmentService.mapDetailToForm(detailData, materials as any);
        return {
            initialValues: mapped,
            initialSnapshot: waterTreatmentService.createSnapshot(mapped),
        };
    }, [detailData, materials, isEditing]);

    // Handlers
    const handleSave = useCallback(
        async (payload: any) => {
            if (!pondId) return;

            if (isEditing && jobId) {
                await updateMutation.mutateAsync({
                    pondId,
                    id: jobId,
                    data: payload,
                });
            } else {
                await createMutation.mutateAsync({
                    pondId,
                    data: payload,
                });
            }
        },
        [pondId, isEditing, jobId, createMutation, updateMutation]
    );

    const handleDelete = useCallback(async () => {
        if (!pondId || !jobId) return;
        await deleteMutation.mutateAsync({ pondId, id: jobId });
    }, [pondId, jobId, deleteMutation]);

    const handleBack = useCallback(() => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    }, [navigation]);

    return (
        <WaterTreatmentForm
            isEditing={isEditing}
            isLoadingDetail={isInitializing}
            isSaving={isSavingActively}
            initialValues={initialValues}
            initialSnapshot={initialSnapshot}
            onSave={handleSave}
            onDelete={handleDelete}
            onBack={handleBack}
        />
    );
};
