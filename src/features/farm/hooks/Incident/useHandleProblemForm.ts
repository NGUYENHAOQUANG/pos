import { useMemo, useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { NormalizedError } from '@/core/api/errorHandler';

import { IMaterial, MaterialGroupType } from '@/features/material/types/material.types';
import { useWarehouses, useWarehouseItems } from '@/features/material/hooks/useWarehouses';
import { useMaterials } from '@/features/material/hooks/useMaterials';
import { documentApi } from '@/features/material/api/documentApi';

import { useCreateIncident, useUpdateIncident } from '@/features/farm/hooks/useIncidentData';
import { incidentApi } from '@/features/farm/api/incidentApi';
import { farmKeys } from '@/features/farm/hooks/farmKeys';
import { JobExecution } from '@/features/farm/types/farm.types';
import { parseDate } from '@/features/farm/utils/dateUtils';
import {
    showAddJobSuccessToast,
    showEditJobSuccessToast,
} from '@/features/farm/utils/toastMessages';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 100;

/**
 * Hook to fetch materials (warehouse items) for HandleProblem screens
 * (Rửa ao, Phơi ao, Xử lý sự cố). Same logic as xyphon/AddSiphonScreen:
 * - List from warehouse items by zone
 * - Merge with material definitions so unitName/name are always set (auto-fill unit in SelectMaterial)
 */
export const useHandleProblemMaterials = (pond: { zoneId?: string | number } | undefined) => {
    const zoneId = pond?.zoneId != null ? String(pond.zoneId) : undefined;
    const { data: warehouses } = useWarehouses({ ZoneId: zoneId });
    const warehouseId = warehouses?.[0]?.id;
    const materialParams = useMemo(() => ({ Page: DEFAULT_PAGE, PageSize: DEFAULT_PAGE_SIZE }), []);
    const { data: warehouseItemsData, isLoading: isLoadingItems } = useWarehouseItems(
        warehouseId,
        materialParams,
        { enabled: !!warehouseId }
    );
    const { data: allMaterials = [] } = useMaterials();

    const materials: IMaterial[] = useMemo(() => {
        if (!warehouseItemsData?.items) return [];
        const items = warehouseItemsData.items;
        return items.map(wItem => {
            const materialDef = allMaterials.find(m => m.id === wItem.materialId);
            return {
                id: wItem.id,
                name: wItem.materialName || materialDef?.name || '',
                group: MaterialGroupType.FARMING,
                unit: wItem.unitId,
                unitName: wItem.unitName || materialDef?.unitName || '',
                remaining: wItem.quantity,
                isActive: true,
                manufacturer: materialDef?.manufacturer,
                type: materialDef?.type,
                usage: materialDef?.usage,
            };
        });
    }, [warehouseItemsData, allMaterials]);

    const isLoading = isLoadingItems;

    return { materials, isLoading };
};

export type SelectedMaterialItem = {
    material: IMaterial;
    quantity: number;
    unit: string;
};

export interface UseHandleProblemFormProps {
    pond: { id: string; zoneId?: string | number } | undefined;
    item: JobExecution | undefined;
}

/**
 * Form hook for Xử lý sự cố (TROUBLESHOOTING / incident) – create/update/delete via API.
 * Mirrors useShrimpHealthCheckForm: state, edit init, handleError, handleSave, confirmDelete.
 */
export const useHandleProblemForm = ({ pond, item }: UseHandleProblemFormProps) => {
    const navigation = useNavigation();
    const queryClient = useQueryClient();
    const { materials } = useHandleProblemMaterials(pond);
    const createIncident = useCreateIncident();
    const updateIncident = useUpdateIncident();

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedMaterials, setSelectedMaterials] = useState<SelectedMaterialItem[]>([]);
    const [note, setNote] = useState('');
    const [imageUris, setImageUris] = useState<string[]>([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Load form when editing (item from list; resolve documentIds → URLs, map materials → names from list)
    useEffect(() => {
        if (!item) return;
        setNote(item.note || '');
        if (item.date) setSelectedDate(new Date(parseDate(item.date)));

        if (item.materials?.length) {
            const mapped = item.materials.map(im => {
                const mat = materials.find(m => m.id === im.material.id);
                return {
                    material:
                        mat ??
                        ({
                            id: im.material.id,
                            name: im.material.name || 'Vật tư',
                            unitName: im.material.unitName || '',
                        } as IMaterial),
                    quantity: im.quantity,
                    unit: im.unit || mat?.unitName || '',
                };
            });
            setSelectedMaterials(mapped);
        }

        if (item.documentIds?.length) {
            documentApi.getUrls(item.documentIds).then(setImageUris);
        } else if (item.images?.length) {
            setImageUris(item.images);
        }
    }, [item, materials]);

    const isSaving = createIncident.isPending || updateIncident.isPending || isDeleting;

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

    const handleSave = (getDocumentIds: () => string[], onSaved?: () => void) => {
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

        const documentIds = getDocumentIds();
        const payload = {
            ...(documentIds.length > 0 && { documentIds }),
            incidentDetail: {
                materials: selectedMaterials.map(m => ({
                    warehouseItemId: m.material.id,
                    quantity: m.quantity,
                })),
                notes: note || '',
            },
        };

        if (item) {
            updateIncident.mutate(
                { pondId: pond.id, id: item.id, payload },
                {
                    onSuccess: () => {
                        onSaved?.();
                        showEditJobSuccessToast('TROUBLESHOOTING');
                        navigation.goBack();
                    },
                    onError: err => handleError(err),
                }
            );
        } else {
            createIncident.mutate(
                { pondId: pond.id, payload },
                {
                    onSuccess: () => {
                        onSaved?.();
                        showAddJobSuccessToast('TROUBLESHOOTING');
                        navigation.goBack();
                    },
                    onError: err => handleError(err),
                }
            );
        }
    };

    const handleDelete = () => setShowDeleteModal(true);

    const confirmDelete = () => {
        if (!pond?.id || !item?.id) {
            setShowDeleteModal(false);
            return;
        }
        setIsDeleting(true);
        incidentApi
            .delete(pond.id, item.id)
            .then(() => {
                queryClient.invalidateQueries({
                    queryKey: farmKeys.incident.byPond(pond.id),
                });
                setShowDeleteModal(false);
                Toast.show({
                    type: 'success',
                    text1: 'Đã xóa sự cố thành công',
                    position: 'top',
                    visibilityTime: 3000,
                });
                navigation.goBack();
            })
            .catch(() => {
                setShowDeleteModal(false);
                Toast.show({
                    type: 'error',
                    text1: 'Không thể xóa. Vui lòng thử lại.',
                    position: 'top',
                    visibilityTime: 3000,
                });
            })
            .then(
                () => setIsDeleting(false),
                () => setIsDeleting(false)
            );
    };

    return {
        materials,
        selectedDate,
        setSelectedDate,
        selectedMaterials,
        setSelectedMaterials,
        note,
        setNote,
        imageUris,
        setImageUris,
        showDeleteModal,
        setShowDeleteModal,
        handleSave,
        handleDelete,
        confirmDelete,
        handleError,
        isSaving,
    };
};
