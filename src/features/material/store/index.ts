/**
 * @file index.ts
 * @description Material Stores - Export all stores for convenience
 * @created 2025-01-XX
 */
export { useMaterialsStore } from '@/features/material/store/materialsStore';
export { useWarehouseStore } from '@/features/material/store/warehouseStore';
export { useInventoryStore } from '@/features/material/store/inventoryStore';
export { useMaterialFiltersStore } from '@/features/material/store/materialFiltersStore';

// Re-export for backward compatibility
// Note: For new code, use individual stores (useMaterialsStore, useWarehouseStore, useInventoryStore)
// This wrapper combines all stores for backward compatibility
import { useMaterialsStore } from '@/features/material/store/materialsStore';
import { useWarehouseStore } from '@/features/material/store/warehouseStore';
import { useInventoryStore } from '@/features/material/store/inventoryStore';

import { useMaterialFiltersStore } from '@/features/material/store/materialFiltersStore';

/**
 * Combined store hook for backward compatibility
 * @deprecated Use useMaterialsStore, useWarehouseStore, useInventoryStore, useMaterialFiltersStore instead
 * This is kept for backward compatibility during migration
 */
export const useMaterialStore = <T = any>(selector?: (state: any) => T): T => {
    // Get state from each store
    const materials = useMaterialsStore(state => state.materials);
    const warehouseList = useWarehouseStore(state => state.warehouseList);
    const inventoryList = useInventoryStore(state => state.inventoryList);

    // Get filters from filters store
    const searchText = useMaterialFiltersStore(state => state.searchText);
    const filterGroup = useMaterialFiltersStore(state => state.filterGroup);
    const filterType = useMaterialFiltersStore(state => state.filterType);
    const filterMaterialName = useMaterialFiltersStore(state => state.filterMaterialName);

    // Get filter actions
    const setSearchText = useMaterialFiltersStore(state => state.setSearchText);
    const setFilterGroup = useMaterialFiltersStore(state => state.setFilterGroup);
    const setFilterType = useMaterialFiltersStore(state => state.setFilterType);
    const setFilterMaterialName = useMaterialFiltersStore(state => state.setFilterMaterialName);
    const resetFilters = useMaterialFiltersStore(state => state.resetFilters);

    // Get actions from each store
    const addMaterial = useMaterialsStore(state => state.addMaterial);
    const getMaterialById = useMaterialsStore(state => state.getMaterialById);
    const getMaterials = useMaterialsStore(state => state.getMaterials);
    const addWarehouseReceipt = useWarehouseStore(state => state.addWarehouseReceipt);
    const getWarehouseReceipts = useWarehouseStore(state => state.getWarehouseReceipts);
    const addInventoryTicket = useInventoryStore(state => state.addInventoryTicket);
    const getInventoryTickets = useInventoryStore(state => state.getInventoryTickets);

    // Deprecated: These should use React Query hooks now
    const fetchMaterials = () => {
        console.warn(
            '[useMaterialStore] fetchMaterials is deprecated. Use useMaterials hook from useMaterials.ts'
        );
    };
    const fetchMaterialById = () => {
        console.warn(
            '[useMaterialStore] fetchMaterialById is deprecated. Use useMaterial hook from useMaterials.ts'
        );
    };
    const createMaterial = () => {
        console.warn(
            '[useMaterialStore] createMaterial is deprecated. Use useCreateMaterial hook from useMaterials.ts'
        );
    };
    const updateMaterial = () => {
        console.warn(
            '[useMaterialStore] updateMaterial is deprecated. Use useUpdateMaterial hook from useMaterials.ts'
        );
    };
    const deleteMaterial = () => {
        console.warn(
            '[useMaterialStore] deleteMaterial is deprecated. Use useDeleteMaterial hook from useMaterials.ts'
        );
    };
    const fetchMaterialGroups = () => {
        console.warn(
            '[useMaterialStore] fetchMaterialGroups is deprecated. Use useMaterialGroups hook from useMaterials.ts'
        );
    };
    const getMaterialGroupOptions = () => {
        console.warn(
            '[useMaterialStore] getMaterialGroupOptions is deprecated. Use useMaterialGroups hook from useMaterials.ts'
        );
        return [];
    };
    const fetchMaterialTypes = () => {
        console.warn(
            '[useMaterialStore] fetchMaterialTypes is deprecated. Use useMaterialTypes hook from useMaterials.ts'
        );
    };
    const fetchMaterialTypesByGroup = () => {
        console.warn(
            '[useMaterialStore] fetchMaterialTypesByGroup is deprecated. Use useMaterialTypesByGroup hook from useMaterials.ts'
        );
    };
    const getMaterialTypeOptions = () => {
        console.warn(
            '[useMaterialStore] getMaterialTypeOptions is deprecated. Use useMaterialTypes hook from useMaterials.ts'
        );
        return [];
    };
    const getAllMaterialTypeOptions = () => {
        console.warn(
            '[useMaterialStore] getAllMaterialTypeOptions is deprecated. Use useMaterialTypes hook from useMaterials.ts'
        );
        return [];
    };
    const fetchUnits = () => {
        console.warn(
            '[useMaterialStore] fetchUnits is deprecated. Use useUnits hook from useMaterials.ts'
        );
    };
    const getUnitOptions = () => {
        console.warn(
            '[useMaterialStore] getUnitOptions is deprecated. Use useUnits hook from useMaterials.ts'
        );
        return [];
    };

    // Deprecated loading states (should use React Query hooks)
    const isLoadingMaterials = false;
    const materialsError = null;
    const materialGroups: any[] = [];
    const materialTypes: any[] = [];
    const units: any[] = [];
    const isLoadingMaterialGroups = false;
    const isLoadingMaterialTypes = false;
    const isLoadingUnits = false;

    const combinedState = {
        // Data
        materials,
        warehouseList,
        inventoryList,
        materialGroups,
        materialTypes,
        units,
        // Loading states
        isLoadingMaterialGroups,
        isLoadingMaterialTypes,
        isLoadingUnits,
        isLoadingMaterials,
        materialsError,
        // UI State
        searchText,
        filterGroup,
        filterType,
        filterMaterialName,
        // Actions - Materials
        fetchMaterials,
        fetchMaterialById,
        createMaterial,
        updateMaterial,
        deleteMaterial,
        addMaterial,
        getMaterialById,
        getMaterials,
        // Actions - Material Groups
        fetchMaterialGroups,
        getMaterialGroupOptions,
        // Actions - Material Types
        fetchMaterialTypes,
        fetchMaterialTypesByGroup,
        getMaterialTypeOptions,
        getAllMaterialTypeOptions,
        // Actions - Units
        fetchUnits,
        getUnitOptions,
        // Actions - Warehouse
        addWarehouseReceipt,
        getWarehouseReceipts,
        // Actions - Inventory
        addInventoryTicket,
        getInventoryTickets,
        // Actions - Filters
        setSearchText,
        setFilterGroup,
        setFilterType,
        setFilterMaterialName,
        resetFilters,
    };

    if (selector) {
        return selector(combinedState) as T;
    }

    return combinedState as T;
};
