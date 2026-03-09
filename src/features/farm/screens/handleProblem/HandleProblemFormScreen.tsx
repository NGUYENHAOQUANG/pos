import React, { useMemo, useState, useEffect } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';

import { FarmStackParamList } from '@/features/farm/navigation/FarmNavigator';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { JobType } from '@/features/farm/components/pondwork/JobItem';
import { formatDate } from '@/features/farm/utils/dateUtils';
import {
    showAddJobSuccessToast,
    showEditJobSuccessToast,
} from '@/features/farm/utils/toastMessages';
import { documentApi } from '@/features/material/api/documentApi';
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

import { handleProblemService } from '../../services/handleproblem-service/handleProblem.service';
import { HandleProblemForm } from './HandleProblemForm';
import { HandleProblemFormValues } from '../../schemas/handleProblemSchema';

type ScreenRouteProp = RouteProp<FarmStackParamList, 'HandleProblem'>;
type NavigationProp = NativeStackNavigationProp<FarmStackParamList>;

export const HandleProblemFormScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<ScreenRouteProp>();

    const { pondId, item, jobType = 'CLEAN_POND' } = route.params || {};
    const currentJobType = jobType as JobType;
    const isEditMode = !!item;

    const updatePondJob = useFarmStore(state => state.updatePondJob);
    const getPondJobItems = useFarmStore(state => state.getPondJobItems);

    const { materials: allMaterials } = useFarmMaterials();

    const materials = useMemo(() => {
        if (!allMaterials.length) return [];
        return allMaterials.filter(m => {
            if (!m.group) return false;
            const name = m.group.toLowerCase();
            return name.includes('thiết bị điện') || name.includes('công cụ');
        });
    }, [allMaterials]);

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

    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const hasDocuments =
        (item?.documentIds?.length ?? 0) > 0 || ((item?.meta as any)?.documentIds?.length ?? 0) > 0;
    const [isLoadingImages, setIsLoadingImages] = useState(hasDocuments);

    // Fetch image URLs if they exist
    useEffect(() => {
        let isMounted = true;
        const fetchUrls = async () => {
            let ids: string[] = [];
            if (item?.documentIds?.length) {
                ids = item.documentIds;
            } else if ((item?.meta as any)?.documentIds?.length) {
                ids = (item?.meta as any).documentIds;
            }

            if (ids.length > 0) {
                try {
                    const urls = await documentApi.getUrls(ids);
                    if (isMounted) setImageUrls(urls);
                } catch (_e) {
                    // ignore
                } finally {
                    if (isMounted) setIsLoadingImages(false);
                }
            } else {
                if (isMounted) setIsLoadingImages(false);
            }
        };
        fetchUrls();
        return () => {
            isMounted = false;
        };
    }, [item]);

    const initialData = useMemo(() => {
        return handleProblemService.mapDetailToForm(item, materials, imageUrls);
    }, [item, materials, imageUrls]);

    const onSubmit = async (data: HandleProblemFormValues, documentIds: string[]) => {
        if (!pondId) return;

        if (data.selectedMaterials.length === 0) {
            Toast.show({
                type: 'error',
                text1: 'Vui lòng chọn vật tư',
                visibilityTime: 3000,
            });
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
                            navigation.goBack();
                        },
                        onError: handleError,
                    }
                );
            }
            return;
        }

        // Fallback for Local Store (if needed)
        const currentItems = getPondJobItems(pondId, currentJobType);
        const timeString = data.selectedDate.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
        });
        const dateString = formatDate(data.selectedDate);

        const jobData = {
            materials: data.selectedMaterials.map(m => ({
                ...m,
                quantity: Number.isNaN(Number(m.quantity)) ? 0 : Number(m.quantity),
            })),
            note: data.note || undefined,
            images: data.imageUris && data.imageUris.length > 0 ? data.imageUris : undefined,
            meta: { ...item?.meta, documentIds },
        };

        if (isEditMode) {
            const updatedItems = currentItems.map((i: any) =>
                i.id === item.id ? { ...i, time: timeString, date: dateString, ...jobData } : i
            );
            updatePondJob(pondId, currentJobType, updatedItems);
            showEditJobSuccessToast(currentJobType);
        } else {
            let maxIndex = 0;
            currentItems.forEach((i: any) => {
                const match = i.label?.match(/Lần (\d+)/);
                if (match) {
                    const idx = parseInt(match[1], 10);
                    if (idx > maxIndex) maxIndex = idx;
                }
            });
            const nextIndex = maxIndex + 1;

            const newItem = {
                id: Date.now().toString(),
                label: `Lần ${nextIndex}`,
                time: timeString,
                date: dateString,
                pondId,
                ...jobData,
            };
            updatePondJob(pondId, currentJobType, [...currentItems, newItem]);
            showAddJobSuccessToast(currentJobType);
        }
        navigation.goBack();
    };

    const onDelete = async () => {
        if (!pondId || !item?.id) return;
        try {
            if (currentJobType === 'CLEAN_POND') {
                await deleteCleanMutation.mutateAsync({ pondId, id: item.id });
                navigation.goBack();
                return;
            }
            if (currentJobType === 'SUN_DRY_POND') {
                await deleteDryMutation.mutateAsync({ pondId, id: item.id });
                navigation.goBack();
                return;
            }
            if (currentJobType === 'TROUBLESHOOTING') {
                await deleteIncidentMutation.mutateAsync({ pondId, id: item.id });
                navigation.goBack();
                return;
            }

            const currentItems = getPondJobItems(pondId, currentJobType);
            const updatedItems = currentItems.filter((i: any) => i.id !== item.id);
            updatePondJob(pondId, currentJobType, updatedItems);
            navigation.goBack();
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
            materials={materials}
            title={getTitle()}
            onBack={() => navigation.goBack()}
            onSubmit={onSubmit}
            onDelete={onDelete}
        />
    );
};

export default HandleProblemFormScreen;
