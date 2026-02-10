import { useState, useEffect, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { NormalizedError } from '@/core/api/errorHandler';

import { useFarmStore } from '@/features/farm/store/farmStore';
import { JobType } from '@/features/farm/components/pondwork/JobItem';
import { formatDate } from '@/features/farm/utils/dateUtils';
import {
    showAddJobSuccessToast,
    showEditJobSuccessToast,
} from '@/features/farm/utils/toastMessages';
import { useMaterials } from '@/features/material/hooks/useMaterials';
import { useWarehouseItems, useWarehouses } from '@/features/material/hooks/useWarehouses';
import { useMaterialGroups } from '@/features/material/hooks/useMaterialGroups';
import { documentApi } from '@/features/material/api/documentApi';
import { IDocument } from '@/shared/types/common.types';

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
import { ICleanRenovationDetail } from '@/features/farm/types/cleanRenovation.types';
import { IDryRenovationDetail } from '@/features/farm/types/dryRenovation.types';
import type {
    CreateIncidentPayload,
    IncidentDetailMaterial,
} from '@/features/farm/types/incident.types';
import { IMaterial } from '@/features/material/types/material.types';

interface UseHandleProblemFormProps {
    pond: any;
    item?: any;
    jobType?: string;
    onSaveSuccess?: () => void;
}

export const useHandleProblemForm = ({
    pond,
    item,
    jobType = 'CLEAN_POND',
    onSaveSuccess,
}: UseHandleProblemFormProps) => {
    const navigation = useNavigation();

    const updatePondJob = useFarmStore(state => state.updatePondJob);
    const getPondJobItems = useFarmStore(state => state.getPondJobItems);

    const currentJobType = jobType as JobType;

    const selectedZoneId = useFarmStore(state => state.selectedZoneId);

    const { data: allMaterials = [] } = useMaterials();

    const { data: warehouses = [] } = useWarehouses({ ZoneId: selectedZoneId || undefined });
    const defaultWarehouseId = warehouses?.[0]?.id;

    const { data: warehouseItemsData } = useWarehouseItems(
        defaultWarehouseId,
        {
            PageSize: 1000,
        },
        { enabled: !!defaultWarehouseId }
    );

    const { data: groups = [] } = useMaterialGroups();

    const allowedGroupIds = useMemo(() => {
        return groups
            .filter(g => {
                const name = g.name.toLowerCase();
                return name.includes('thiết bị điện') || name.includes('công cụ');
            })
            .map(g => g.id);
    }, [groups]);

    const materials: IMaterial[] = useMemo(() => {
        return (warehouseItemsData?.items || [])
            .filter((item: any) => {
                const materialDef = allMaterials.find((m: any) => m.id === item.materialId);
                const groupId = item.material?.materialGroup?.id || materialDef?.groupId;
                return allowedGroupIds.includes(groupId);
            })
            .map((item: any) => {
                const materialDef = allMaterials.find((m: any) => m.id === item.materialId);

                return {
                    id: item.id,
                    name:
                        item.materialName || item.material?.name || materialDef?.name || 'Unknown',
                    group: item.material?.materialGroup?.name || '',
                    unit: item.unitId || materialDef?.unit || '',
                    unitName:
                        item.unitName || item.material?.unit?.name || materialDef?.unitName || '',
                    remaining: item.quantity || 0,
                };
            });
    }, [warehouseItemsData, allMaterials, allowedGroupIds]);

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

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedMaterials, setSelectedMaterials] = useState<
        Array<{ material: IMaterial; quantity: number; unit: string }>
    >([]);
    const [note, setNote] = useState('');
    const [imageUris, setImageUris] = useState<string[]>([]);
    const [initialDocumentIds, setInitialDocumentIds] = useState<string[]>([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        if (item) {
            setNote(item.note || '');
            if (item.materials) {
                const enrichedMaterials = item.materials.map((m: any) => {
                    const warehouseItem = materials.find(wm => wm.id === m.material.id);
                    if (warehouseItem) {
                        return {
                            material: warehouseItem,
                            quantity: m.quantity,
                            unit: warehouseItem.unitName || '',
                        };
                    }
                    return m;
                });
                setSelectedMaterials(enrichedMaterials);
            }
            // Resolve image URLs: incident/API có documentIds → gọi documentApi.getUrls; fallback item.images (Rửa ao/Phơi ao)
            if (item.documentIds?.length) {
                setInitialDocumentIds(item.documentIds);
                documentApi.getUrls(item.documentIds).then(setImageUris);
            } else if (item.meta?.documentIds?.length) {
                setInitialDocumentIds(item.meta.documentIds);
                documentApi.getUrls(item.meta.documentIds).then(setImageUris);
            } else if (item.images?.length) {
                setImageUris(item.images);
            }
            if (item.date) {
            }
        }
    }, [item, materials]);

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
        const error = err as NormalizedError;
        if (error.type === 'VALIDATION_ERROR') {
            const firstFieldKey = Object.keys(error.fields)[0];
            if (firstFieldKey && error.fields[firstFieldKey]?.length > 0) {
                Toast.show({
                    type: 'error',
                    text1: error.fields[firstFieldKey][0],
                    visibilityTime: 4000,
                });
                return;
            }
        }

        if (error.type === 'NOT_FOUND_ERROR') {
            Toast.show({
                type: 'error',
                text1: error.message,
                visibilityTime: 4000,
            });
            return;
        }

        Toast.show({ type: 'error', text1: error.message || 'Có lỗi xảy ra' });
    };

    /** Map documentIds (from upload) to IDocument[] for create payload – dùng common.types.IDocument */
    const mapDocumentIdsToDocuments = (ids: string[]): IDocument[] => ids.map(id => ({ id }));

    const handleSave = (documentIds: string[]) => {
        if (selectedMaterials.length === 0) {
            Toast.show({
                type: 'error',
                text1: 'Vui lòng chọn vật tư',
                position: 'top',
                visibilityTime: 3000,
            });
            return;
        }

        if (!pond?.id) return;

        const documents: IDocument[] = mapDocumentIdsToDocuments(documentIds);
        const documentIdsForApi = documents.map(d => d.id);

        // material.id từ danh sách warehouse items = warehouseItemId (API incident/clean/dry)
        const apiMaterials = selectedMaterials
            .filter(m => m.material?.id)
            .map(m => ({
                warehouseItemId: m.material.id,
                quantity: Number(m.quantity) || 0,
            }));

        if (apiMaterials.length === 0) {
            Toast.show({
                type: 'error',
                text1: 'Vui lòng chọn vật tư có id hợp lệ',
                position: 'top',
                visibilityTime: 3000,
            });
            return;
        }

        const commonPayload = {
            notes: note,
            materials: apiMaterials,
        };

        if (currentJobType === 'CLEAN_POND') {
            const detail: ICleanRenovationDetail = commonPayload;
            if (item) {
                // Update
                updateCleanMutation.mutate(
                    {
                        pondId: pond.id,
                        id: item.id,
                        detail,
                        documentIds: documentIdsForApi,
                    },
                    {
                        onSuccess: () => {
                            onSaveSuccess?.();
                            showEditJobSuccessToast(currentJobType);
                            navigation.goBack();
                        },
                        onError: handleError,
                    }
                );
            } else {
                createCleanMutation.mutate(
                    {
                        pondId: pond.id,
                        detail,
                        documentIds: documentIdsForApi,
                    },
                    {
                        onSuccess: () => {
                            onSaveSuccess?.();
                            showAddJobSuccessToast(currentJobType);
                            navigation.goBack();
                        },
                        onError: handleError,
                    }
                );
            }
            return;
        }

        if (currentJobType === 'SUN_DRY_POND') {
            const detail: IDryRenovationDetail = commonPayload;
            if (item) {
                // Update
                updateDryMutation.mutate(
                    {
                        pondId: pond.id,
                        id: item.id,
                        detail,
                        documentIds: documentIdsForApi,
                    },
                    {
                        onSuccess: () => {
                            onSaveSuccess?.();
                            showEditJobSuccessToast(currentJobType);
                            navigation.goBack();
                        },
                        onError: handleError,
                    }
                );
            } else {
                // Create – payload dùng documentIds từ IDocument[] (map từ common.types)
                createDryMutation.mutate(
                    {
                        pondId: pond.id,
                        detail,
                        documentIds: documentIdsForApi,
                    },
                    {
                        onSuccess: () => {
                            onSaveSuccess?.();
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
            const incidentMaterials: IncidentDetailMaterial[] = apiMaterials;
            const incidentDetail = {
                materials: incidentMaterials,
                notes: note || '',
            };
            const payload: CreateIncidentPayload = {
                incidentDetail,
                ...(documentIdsForApi.length > 0 && { documentIds: documentIdsForApi }),
            };
            if (item) {
                updateIncidentMutation.mutate(
                    {
                        pondId: pond.id,
                        id: item.id,
                        payload: {
                            incidentDetail,
                            ...(documentIdsForApi.length > 0 && { documentIds: documentIdsForApi }),
                        },
                    },
                    {
                        onSuccess: () => {
                            onSaveSuccess?.();
                            showEditJobSuccessToast(currentJobType);
                            navigation.goBack();
                        },
                        onError: handleError,
                    }
                );
            } else {
                createIncidentMutation.mutate(
                    {
                        pondId: pond.id,
                        payload,
                    },
                    {
                        onSuccess: () => {
                            onSaveSuccess?.();
                            showAddJobSuccessToast(currentJobType);
                            navigation.goBack();
                        },
                        onError: handleError,
                    }
                );
            }
            return;
        }

        // Fallback for others (Mock/Local Store)
        const currentItems = getPondJobItems(pond.id, currentJobType);
        const timeString = selectedDate.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
        });
        const dateString = formatDate(selectedDate);

        const jobData = {
            materials: selectedMaterials,
            note: note || undefined,
            images: imageUris.length > 0 ? imageUris : undefined,
            meta: {
                ...item?.meta,
                documentIds,
            },
        };

        if (item) {
            const updatedItems = currentItems.map((i: any) =>
                i.id === item.id ? { ...i, time: timeString, date: dateString, ...jobData } : i
            );
            updatePondJob(pond.id, currentJobType, updatedItems);
            showEditJobSuccessToast(currentJobType);
        } else {
            let maxIndex = 0;
            currentItems.forEach((i: any) => {
                const match = i.label.match(/Lần (\d+)/);
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
                pondId: pond.id,
                ...jobData,
            };
            updatePondJob(pond.id, currentJobType, [...currentItems, newItem]);
            showAddJobSuccessToast(currentJobType);
        }
        navigation.goBack();
    };

    const handleDelete = () => setShowDeleteModal(true);

    const confirmDelete = async () => {
        if (!pond?.id || !item?.id) return;

        setShowDeleteModal(false);
        await new Promise(resolve => setTimeout(() => resolve(null), 400));

        try {
            if (currentJobType === 'CLEAN_POND') {
                await deleteCleanMutation.mutateAsync({ pondId: pond.id, id: item.id });
                navigation.goBack();
                return;
            }

            if (currentJobType === 'SUN_DRY_POND') {
                await deleteDryMutation.mutateAsync({ pondId: pond.id, id: item.id });
                navigation.goBack();
                return;
            }

            if (currentJobType === 'TROUBLESHOOTING') {
                await deleteIncidentMutation.mutateAsync({ pondId: pond.id, id: item.id });
                navigation.goBack();
                return;
            }

            const currentItems = getPondJobItems(pond.id, currentJobType);
            const updatedItems = currentItems.filter((i: any) => i.id !== item.id);
            updatePondJob(pond.id, currentJobType, updatedItems);
            navigation.goBack();
        } catch (error) {
            handleError(error);
        }
    };

    const cancelDelete = () => setShowDeleteModal(false);

    return {
        selectedDate,
        setSelectedDate,
        selectedMaterials,
        setSelectedMaterials,
        note,
        setNote,
        imageUris,
        setImageUris,
        showDeleteModal,
        handleSave,
        handleDelete,
        confirmDelete,
        cancelDelete,
        getTitle,
        materials,
        isSaving,
        initialDocumentIds,
    };
};
