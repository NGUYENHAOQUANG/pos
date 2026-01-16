/**
 * @file index.ts
 * @description Material Stores - Export all stores for convenience
 * @note For new code, use individual stores directly instead of useMaterialStore
 */
export { useMaterialsStore } from '@/features/material/store/materialsStore';
export { useWarehouseStore } from '@/features/material/store/warehouseStore';
export { useInventoryStore } from '@/features/material/store/inventoryStore';
export { useMaterialFiltersStore } from '@/features/material/store/materialFiltersStore';
export { useMaterialGroupsStore } from '@/features/material/store/materialGroupsStore';
export { useMaterialTypesStore } from '@/features/material/store/materialTypesStore';
export { useUnitsStore } from '@/features/material/store/unitsStore';

import { useMaterialsStore } from '@/features/material/store/materialsStore';
import { useWarehouseStore } from '@/features/material/store/warehouseStore';
import { useInventoryStore } from '@/features/material/store/inventoryStore';
import { useMaterialFiltersStore } from '@/features/material/store/materialFiltersStore';

/**
 * Combined store hook for backward compatibility
 * @deprecated Use individual stores directly:
 * - useMaterialsStore for materials
 * - useWarehouseStore for warehouse
 * - useInventoryStore for inventory
 * - useMaterialFiltersStore for filters
 * - React Query hooks from @/features/material/hooks for server state
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

    const combinedState = {
        // Data
        materials,
        warehouseList,
        inventoryList,
        // UI State
        searchText,
        filterGroup,
        filterType,
        filterMaterialName,
        // Actions - Materials
        addMaterial,
        getMaterialById,
        getMaterials,
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
