import React, { useEffect, useMemo, useState } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';

import { useTabBarVisibility } from '@/app/navigation/TabBarVisibilityContext';
import { AppStackParamList } from '@/app/navigation/AppStack';
import { useEnvironmentInit } from '@/features/farm/hooks/pondwork/envhooks/useEnvironmentLogic';
import { useFarmStore } from '@/features/farm/store/farmStore';
import {
    useCreateEnvMeasurement,
    useUpdateEnvMeasurement,
    useDeleteEnvMeasurement,
    useEnvMeasurement,
} from '@/features/farm/hooks/useEnvMeasurement';

import { EnvironmentFormValues } from '@/features/farm/schemas/environmentFormSchema';
import { environmentService } from '@/features/farm/services/pond-work/environment.service';
import { useDocumentUrls } from '@/shared/hooks/useDocumentUrls';
import { useSyncDocuments } from '@/shared/hooks/useDocumentUpload';
import { AddEnvironmentForm } from '@/features/farm/screens/pondwork/environment-form/AddEnvironmentForm';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;
type ScreenRouteProp = RouteProp<AppStackParamList, 'AddEnvironmentScreen'>;
export const AddEnvironmentScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();
    const { pondId, environmentId } = route.params || {};
    const { setTabBarVisible } = useTabBarVisibility();
    const isEditMode = !!environmentId;

    const selectedZoneId = useFarmStore(state => state.selectedZoneId);

    // --- Server State ---
    const { isLoading, metricTypes, parameterSettings } = useEnvironmentInit(selectedZoneId!);

    const { data: apiData } = useEnvMeasurement(pondId, environmentId || '');
    const detail = apiData?.data;

    const createEnvMeasurement = useCreateEnvMeasurement();
    const updateEnvMeasurement = useUpdateEnvMeasurement();
    const deleteEnvMeasurement = useDeleteEnvMeasurement();

    // --- Image State ---
    const currentDocIds = useMemo(() => detail?.documentIds || [], [detail?.documentIds]);
    const { imageUris, setImageUris } = useDocumentUrls(currentDocIds);
    // documentIds state to track the IDs that are currently loaded map to the images
    const [documentIds, setDocumentIds] = useState<string[]>([]);
    const [initialImageUris, setInitialImageUris] = useState<string[]>([]);

    useEffect(() => {
        if (detail?.documentIds) {
            setDocumentIds(detail.documentIds);
        }
    }, [detail?.documentIds]);

    useEffect(() => {
        if (imageUris.length > 0 && initialImageUris.length === 0) {
            setInitialImageUris(imageUris);
        }
    }, [imageUris, initialImageUris.length]);

    const initialData = useMemo<EnvironmentFormValues | null>(() => {
        if (detail) {
            return environmentService.mapDetailToForm(detail, metricTypes);
        }
        return null;
    }, [detail, metricTypes]);

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    const hasImagesChanged = useMemo(() => {
        if (!environmentId) return false;
        if (imageUris.length !== initialImageUris.length) return true;
        for (let i = 0; i < imageUris.length; i++) {
            if (imageUris[i] !== initialImageUris[i]) return true;
        }
        return false;
    }, [imageUris, initialImageUris, environmentId]);

    const initialAdvancedParams = useMemo(
        () =>
            environmentService.computeAdvancedParams(
                selectedZoneId!,
                parameterSettings,
                metricTypes
            ),
        [selectedZoneId, parameterSettings, metricTypes]
    );

    const [advancedParameters, setAdvancedParameters] =
        useState<Array<{ id: string; name: string }>>(initialAdvancedParams);

    useEffect(() => {
        if (
            initialAdvancedParams.length > 0 ||
            (selectedZoneId && parameterSettings[selectedZoneId])
        ) {
            setAdvancedParameters(initialAdvancedParams);
        }
    }, [initialAdvancedParams, selectedZoneId, parameterSettings]);

    useEffect(() => {
        setTabBarVisible(false);
    }, [setTabBarVisible]);

    // --- Limits (Service — no hook wrapper) ---
    const limitsWithCodes = useMemo(() => {
        const currentSettings = selectedZoneId ? parameterSettings[selectedZoneId] : undefined;
        const parameterLimits = environmentService.computeParameterLimits(
            currentSettings,
            metricTypes
        );
        return environmentService.mapLimitsToCodes(parameterLimits, metricTypes);
    }, [selectedZoneId, parameterSettings, metricTypes]);

    // --- Handlers ---
    const handleBack = () => {
        if (navigation.canGoBack()) navigation.goBack();
    };

    const handleCancel = () => navigation.goBack();

    const handleSetupPress = () => {
        navigation.navigate('SettingEnvironment', {
            data: { advancedParameters },
        });
    };

    const { uploadAndSyncDocuments, markUploadsAsSaved } = useSyncDocuments();
    const [isUploading, setIsUploading] = useState(false);

    const handleSubmit = async (values: EnvironmentFormValues) => {
        if (!pondId) {
            Toast.show({ type: 'error', text1: 'Không tìm thấy thông tin ao' });
            return;
        }

        setIsUploading(true);
        try {
            const finalDocIds = await uploadAndSyncDocuments(
                imageUris,
                initialImageUris,
                documentIds
            );

            const measurements = environmentService.mapFormToPayload(
                metricTypes,
                values,
                advancedParameters
            );

            const commonData = {
                documentIds: finalDocIds,
                envMeasurementDetail: {
                    envMeasurementDetails: measurements,
                    notes: values.notes,
                },
            };

            const onMutationSuccess = () => {
                markUploadsAsSaved();
                navigation.goBack();
            };

            if (environmentId) {
                updateEnvMeasurement.mutate(
                    { pondId, id: environmentId, data: commonData },
                    { onSuccess: onMutationSuccess }
                );
            } else {
                createEnvMeasurement.mutate(
                    { pondId, data: commonData },
                    { onSuccess: onMutationSuccess }
                );
            }
        } catch (error) {
            console.error('Submit failed', error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = () => {
        if (!pondId || !environmentId) return;

        deleteEnvMeasurement.mutate(
            { pondId, id: environmentId },
            {
                onSuccess: () => {
                    setDeleteModalVisible(false);
                    setTimeout(() => navigation.goBack(), 300);
                },
            }
        );
    };

    const isSubmitting =
        isUploading ||
        createEnvMeasurement.isPending ||
        updateEnvMeasurement.isPending ||
        deleteEnvMeasurement.isPending;

    return (
        <AddEnvironmentForm
            key={initialData ? 'loaded' : 'loading'}
            isEditMode={isEditMode}
            isLoading={isLoading}
            isSubmitting={isSubmitting}
            initialData={initialData}
            imageUris={imageUris}
            onImagesChange={setImageUris}
            hasImagesChanged={hasImagesChanged}
            limits={limitsWithCodes}
            advancedParameters={advancedParameters}
            onSetupPress={handleSetupPress}
            onBack={handleBack}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
            onDeletePress={() => setDeleteModalVisible(true)}
            deleteModalVisible={deleteModalVisible}
            onConfirmDelete={handleDelete}
            onCancelDelete={() => setDeleteModalVisible(false)}
        />
    );
};
