import { useMemo } from 'react';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { useMaterials } from '@/features/material/hooks/useMaterials';
import { useMaterialGroups } from '@/features/material/hooks/useMaterialGroups';
import { useWarehouseItems } from '@/features/material/hooks/useWarehouses';
import { IMaterial } from '@/features/material/types/material.types';
import { APP_CONFIG } from '@/shared/constants';

export const useFarmMaterials = () => {
    const warehouseId = useFarmStore(state => state.currentWarehouseId);

    const { data: allMaterials = [] } = useMaterials();
    const { data: groups = [] } = useMaterialGroups();

    const { data: warehouseItemsData, isLoading: warehouseItemsLoading } = useWarehouseItems(
        warehouseId ?? undefined,
        {
            PageSize: APP_CONFIG.MAX_PAGE_SIZE,
        },
        { enabled: !!warehouseId }
    );

    const materials: IMaterial[] = useMemo(() => {
        return (warehouseItemsData?.items || []).map((item: any) => {
            const materialDef = allMaterials.find((m: any) => m.id === item.materialId);
            const groupId =
                item.material?.materialGroup?.id ||
                (materialDef as any)?.materialGroupId ||
                (materialDef as any)?.groupId;
            const groupDef = groups.find((g: any) => g.id === groupId);

            return {
                id: item.id,
                materialDefId: item.materialId,
                name: item.materialName || item.material?.name || materialDef?.name || 'Vật tư',
                group: item.material?.materialGroup?.name || groupDef?.name || '',
                unit: item.unitId || materialDef?.unit || '',
                unitName: item.unitName || item.material?.unit?.name || materialDef?.unitName || '',
                remaining: item.quantity || 0,
            } as IMaterial;
        });
    }, [warehouseItemsData, allMaterials, groups]);

    const materialMap = useMemo(() => {
        const map: Record<string, IMaterial> = {};
        materials.forEach(curr => {
            // Primary key: warehouse item id
            map[curr.id] = curr;
            // Secondary key: material definition id (for APIs that return materialId instead of warehouseItemId)
            if (curr.materialDefId && !map[curr.materialDefId]) {
                map[curr.materialDefId] = curr;
            }
        });
        return map;
    }, [materials]);

    return {
        materials,
        materialMap,
        isLoading: warehouseItemsLoading,
    };
};
