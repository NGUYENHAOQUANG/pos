import { useMemo } from 'react';
import { useFarmStore } from '@/features/farm/store/farmStore';
import { useMaterials } from '@/features/material/hooks/useMaterials';
import { useMaterialGroups } from '@/features/material/hooks/useMaterialGroups';
import { useWarehouseItems, useWarehouses } from '@/features/material/hooks/useWarehouses';
import { IMaterial } from '@/features/material/types/material.types';

export const useFarmMaterials = () => {
    const selectedZoneId = useFarmStore(state => state.selectedZoneId);

    const { data: allMaterials = [] } = useMaterials();
    const { data: groups = [] } = useMaterialGroups();

    const { data: warehouses = [] } = useWarehouses({ ZoneId: selectedZoneId || undefined });
    const defaultWarehouseId = warehouses?.[0]?.id;

    const { data: warehouseItemsData, isLoading: warehouseItemsLoading } = useWarehouseItems(
        defaultWarehouseId,
        {
            PageSize: 1000,
        },
        { enabled: !!defaultWarehouseId }
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
        return materials.reduce((acc, curr) => {
            acc[curr.id] = curr;
            return acc;
        }, {} as Record<string, IMaterial>);
    }, [materials]);

    return {
        materials,
        materialMap,
        isLoading: warehouseItemsLoading,
    };
};
