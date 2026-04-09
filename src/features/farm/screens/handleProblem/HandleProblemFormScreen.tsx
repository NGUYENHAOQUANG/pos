import React, { useMemo } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';

import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { JobType } from '@/features/farm/components/pondwork/JobItem';
import {
    showAddJobSuccessToast,
    showEditJobSuccessToast,
    showMaterialQuantityZeroToast,
} from '@/features/farm/utils/toastMessages';
import { useDocumentUrls } from '@/shared/hooks/useDocumentUrls';
import { Loading } from '@/shared/components/ui/Loading';
import { getErrorMessage } from '@/features/material/utils/errorHandlers';

import {
    useCreateCleanRenovation,
    useUpdateCleanRenovation,
    useDeleteCleanRenovation,
} from '@/features/farm/hooks/useCleanRenovation';
import {
    useCreateDryRenovation,
    useUpdateDryRenovation,
    useDeleteDryRenovation,
} from '@/features/farm/hooks/useDryRenovation';
import {
    useCreateIncident,
    useUpdateIncident,
    useDeleteIncident,
} from '@/features/farm/hooks/useIncidentData';
import { useFarmMaterials } from '@/features/farm/hooks/useFarmMaterials';

import { handleProblemService } from '@/features/farm/services/pond-work/handleProblem.service';
import { HandleProblemForm } from '@/features/farm/screens/handleProblem/HandleProblemForm';
import { HandleProblemFormValues } from '@/features/farm/schemas/handleProblemSchema';

type ScreenRouteProp = RouteProp<FarmStackParamList, 'HandleProblem'>;
type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;

export const HandleProblemFormScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();

    const { pondId, item, jobType = 'CLEAN_POND' } = route.params || {};
    const currentJobType = jobType as JobType;
    const isEditMode = !!item;

    const { materials: allMaterials } = useFarmMaterials();

    const createCleanMutation = useCreateCleanRenovation();
    const updateCleanMutation = useUpdateCleanRenovation();
    const deleteCleanMutation = useDeleteCleanRenovation();

    const createDryMutation = useCreateDryRenovation();
    const updateDryMutation = useUpdateDryRenovation();
    const deleteDryMutation = useDeleteDryRenovation();

    const createIncidentMutation = useCreateIncident();
    const updateIncidentMutation = useUpdateIncident();
    const deleteIncidentMutation = useDeleteIncident();

    const isSaving =
        createCleanMutation.isPending ||
        updateCleanMutation.isPending ||
        createDryMutation.isPending ||
        updateDryMutation.isPending ||
        createIncidentMutation.isPending ||
        updateIncidentMutation.isPending ||
        deleteCleanMutation.isPending ||
        deleteDryMutation.isPending ||
        deleteIncidentMutation.isPending;

    const getTitle = () => {
        switch (currentJobType) {
            case 'CLEAN_POND':
                return 'Rửa ao';
            case 'SUN_DRY_POND':
                return 'Phơi ao';
            case 'TROUBLESHOOTING':
                return 'Xử lý sự cố';
            default:
                return 'Xử lý sự cố';
        }
    };

    const handleError = (err: unknown) => {
        let message = getErrorMessage(err, 'Có lỗi xảy ra');

        if (
            message.includes('invalid start of a value') ||
            message.includes('converted to System.Decimal') ||
            message.includes('System.Decimal')
        ) {
            message = 'Số lượng vật tư không hợp lệ';
        }

        Toast.show({
            type: 'error',
            text1: 'Lưu thất bại',
            text2: message,
            visibilityTime: 4000,
        });
    };

    const currentDocIds = useMemo(() => {
        let ids: string[] = [];
        if (item?.documentIds?.length) {
            ids = item.documentIds;
        } else if ((item?.meta as any)?.documentIds?.length) {
            ids = (item?.meta as any).documentIds;
        }
        return ids;
    }, [item]);

    const { imageUris: imageUrls, isLoadingImages } = useDocumentUrls(currentDocIds);

    const initialData = useMemo(() => {
        return handleProblemService.mapDetailToForm(item, allMaterials, imageUrls);
    }, [item, allMaterials, imageUrls]);

    const onSubmit = async (
        data: HandleProblemFormValues,
        documentIds: string[],
        markUploadsAsSaved: () => void
    ) => {
        if (!pondId) return;

        // Material required only for CLEAN_POND (Rửa ao)
        if (currentJobType === 'CLEAN_POND' && data.selectedMaterials.length === 0) {
            Toast.show({
                type: 'error',
                text1: 'Vui lòng chọn vật tư',
                visibilityTime: 3000,
            });
            return;
        }

        // Validate material quantities must be greater than 0 (only when materials selected)
        if (
            data.selectedMaterials.length > 0 &&
            data.selectedMaterials.some(m => m.quantity <= 0)
        ) {
            showMaterialQuantityZeroToast();
            return;
        }

        const payload = handleProblemService.mapFormToPayload(data, currentJobType);
        if (!payload) return;

        // Re-inject the document IDs obtained from the box
        if ('documentIds' in payload) {
            payload.documentIds = documentIds;
        } else if ('incidentDetail' in payload) {
            (payload as any).documentIds = documentIds.length > 0 ? documentIds : undefined;
        }

        if (currentJobType === 'CLEAN_POND') {
            try {
                if (isEditMode) {
                    const res: any = await updateCleanMutation.mutateAsync({
                        pondId,
                        id: item.id,
                        ...(payload as any),
                    });

                    // Backend may return success flag even on 200
                    if (!res?.success) {
                        Toast.show({
                            type: 'error',
                            text1: res?.message || 'Cập nhật nhật ký cải tạo ao thất bại',
                            visibilityTime: 4000,
                        });
                        return;
                    }

                    showEditJobSuccessToast(currentJobType);
                    markUploadsAsSaved();
                    navigation.goBack();
                } else {
                    const res: any = await createCleanMutation.mutateAsync({
                        pondId,
                        ...(payload as any),
                    });

                    if (!res?.success) {
                        Toast.show({
                            type: 'error',
                            text1: res?.message || 'Tạo nhật ký cải tạo ao thất bại',
                            visibilityTime: 4000,
                        });
                        return;
                    }

                    showAddJobSuccessToast(currentJobType);
                    markUploadsAsSaved();
                    navigation.goBack();
                }
            } catch (error) {
                handleError(error);
            }
            return;
        }

        if (currentJobType === 'SUN_DRY_POND') {
            if (isEditMode) {
                updateDryMutation.mutate(
                    { pondId, id: item.id, ...(payload as any) },
                    {
                        onSuccess: () => {
                            showEditJobSuccessToast(currentJobType);
                            markUploadsAsSaved();
                            navigation.goBack();
                        },
                        onError: handleError,
                    }
                );
            } else {
                createDryMutation.mutate(
                    { pondId, ...(payload as any) },
                    {
                        onSuccess: () => {
                            showAddJobSuccessToast(currentJobType);
                            markUploadsAsSaved();
                            navigation.goBack();
                        },
                        onError: handleError,
                    }
                );
            }
            return;
        }

        if (currentJobType === 'TROUBLESHOOTING') {
            if (isEditMode) {
                updateIncidentMutation.mutate(
                    { pondId, id: item.id, payload: payload as any },
                    {
                        onSuccess: () => {
                            showEditJobSuccessToast(currentJobType);
                            markUploadsAsSaved();
                            navigation.goBack();
                        },
                        onError: handleError,
                    }
                );
            } else {
                createIncidentMutation.mutate(
                    { pondId, payload: payload as any },
                    {
                        onSuccess: () => {
                            showAddJobSuccessToast(currentJobType);
                            markUploadsAsSaved();
                            navigation.goBack();
                        },
                        onError: handleError,
                    }
                );
            }
            return;
        }

        navigation.goBack();
    };

    const onDelete = async () => {
        if (!pondId || !item?.id) return;
        try {
            if (currentJobType === 'CLEAN_POND') {
                await deleteCleanMutation.mutateAsync({ pondId, id: item.id });
                setTimeout(() => navigation.goBack(), 300);
                return;
            }
            if (currentJobType === 'SUN_DRY_POND') {
                await deleteDryMutation.mutateAsync({ pondId, id: item.id });
                setTimeout(() => navigation.goBack(), 300);
                return;
            }
            if (currentJobType === 'TROUBLESHOOTING') {
                await deleteIncidentMutation.mutateAsync({ pondId, id: item.id });
                setTimeout(() => navigation.goBack(), 300);
                return;
            }
        } catch (error) {
            handleError(error);
        }
    };

    if (isLoadingImages) {
        return <Loading isLoading={true} />;
    }

    return (
        <HandleProblemForm
            isEditMode={isEditMode}
            isSaving={isSaving}
            initialData={initialData}
            title={getTitle()}
            onBack={() => navigation.goBack()}
            onSubmit={onSubmit}
            onDelete={onDelete}
            isMaterialRequired={currentJobType === 'CLEAN_POND'}
        />
    );
};

export default HandleProblemFormScreen;
