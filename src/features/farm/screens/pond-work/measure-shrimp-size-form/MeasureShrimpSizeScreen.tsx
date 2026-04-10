import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { useActiveCycle } from '@/features/farm/hooks/useCycle';
import { usePondDetail } from '@/features/farm/hooks/usePonds';

import {
    useCreateSizeMeasurement,
    useUpdateSizeMeasurement,
    useDeleteSizeMeasurement,
    useSizeMeasurement,
} from '@/features/farm/hooks/useSizeMeasurement';
import { MeasureShrimpSizeFormValues } from '@/features/farm/schemas/measureShrimpSizeSchema';
import { measureShrimpSizeService } from '@/features/farm/services/pond-work/measure-shrimp-size.service';
import { useDocumentUrls } from '@/shared/hooks/useDocumentUrls';
import { MeasureShrimpSizeForm } from './MeasureShrimpSizeForm';

type MeasureShrimpSizeScreenRouteProp = RouteProp<AppStackParamList, 'MeasureShrimpSizeScreen'>;
type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

export const MeasureShrimpSizeScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<MeasureShrimpSizeScreenRouteProp>();

    // Support either MeasureShrimpSizeId standard or pondId/aiShrimpSize override
    const { measureShrimpSizeId, pondId, aiShrimpSize } = route.params || {};
    const { setTabBarVisible } = useTabBarVisibility();
    const zoneId = useFarmStore(state => state.selectedZoneId) || '';

    const measurementId = measureShrimpSizeId;
    const isEditing = !!measurementId;

    // --- Data Fetching ---
    const { data: currentPond } = usePondDetail(zoneId, pondId || '');
    const { data: activeCycleData } = useActiveCycle(currentPond?.id || '');
    const { data: detailResponse, isLoading: isLoadingDetail } = useSizeMeasurement(
        isEditing ? currentPond?.id || '' : '',
        isEditing ? measurementId : ''
    );
    const detail = detailResponse?.data || null;

    // --- Mutations ---
    const createMutation = useCreateSizeMeasurement();
    const updateMutation = useUpdateSizeMeasurement();
    const deleteMutation = useDeleteSizeMeasurement();

    const isSavingActively =
        createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

    const currentDocIds = useMemo(
        () => detail?.documentIds || detail?.documents?.map(d => d.id) || [],
        [detail?.documentIds, detail?.documents]
    );
    const { imageUris } = useDocumentUrls(currentDocIds);

    // Minimum visual loading time (skeleton logic)
    const [initialLoading, setInitialLoading] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => setInitialLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    const isInitializing = initialLoading || (isEditing && isLoadingDetail);

    const initialValues: MeasureShrimpSizeFormValues = useMemo(() => {
        if (!detail) return measureShrimpSizeService.createDefaultFormValues();
        return measureShrimpSizeService.mapDetailToForm(detail, imageUris);
    }, [detail, imageUris]);

    const initialSnapshot = useMemo(() => {
        if (!detail) return null;
        return measureShrimpSizeService.createSnapshot(initialValues);
    }, [detail, initialValues]);

    const stockingQuantity = useMemo(() => {
        if (!activeCycleData) return undefined;
        return (
            (activeCycleData as any).transferInfo?.originalCycle?.totalStocking ??
            (activeCycleData as any).stockingQuantity ??
            activeCycleData.totalStocking
        );
    }, [activeCycleData]);

    useEffect(() => {
        setTabBarVisible(false);
    }, [setTabBarVisible]);

    const handleSave = useCallback(
        async (payload: any) => {
            const actualPondId = currentPond?.id || pondId;
            if (!actualPondId) {
                navigation.goBack();
                return;
            }

            if (isEditing && measurementId) {
                await updateMutation.mutateAsync({
                    pondId: actualPondId,
                    id: measurementId,
                    data: payload,
                });
            } else {
                await createMutation.mutateAsync({
                    pondId: actualPondId,
                    data: payload,
                });
            }
        },
        [
            currentPond?.id,
            pondId,
            isEditing,
            measurementId,
            createMutation,
            updateMutation,
            navigation,
        ]
    );

    const handleDelete = useCallback(async () => {
        const actualPondId = currentPond?.id || pondId;
        if (!actualPondId || !measurementId) return;
        await deleteMutation.mutateAsync({ pondId: actualPondId, id: measurementId });
    }, [currentPond?.id, pondId, measurementId, deleteMutation]);

    const handleBack = useCallback(() => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    }, [navigation]);

    const handleAIMeasurePress = useCallback(() => {
        const actualPondId = currentPond?.id || pondId;
        navigation.navigate('MeasureShrimpSizeAIScreen', {
            pondId: actualPondId || '',
            onReturnData: (aiSize: string) => {
                navigation.setParams({ aiShrimpSize: aiSize });
            },
        } as never);
    }, [currentPond?.id, pondId, navigation]);

    return (
        <MeasureShrimpSizeForm
            isEditing={isEditing}
            isLoadingDetail={isInitializing}
            isSaving={isSavingActively}
            initialValues={initialValues}
            initialSnapshot={initialSnapshot}
            aiShrimpSize={aiShrimpSize}
            stockingQuantity={stockingQuantity ? Number(stockingQuantity) : undefined}
            onSave={handleSave}
            onDelete={handleDelete}
            onBack={handleBack}
            onAIMeasurePress={handleAIMeasurePress}
        />
    );
};
