/**
 * @file index.ts
 * @description Material Stores - Export all stores for convenience
 * @created 2025-01-XX
 */
export { useMaterialsStore } from './materialsStore';
export { useWarehouseStore } from './warehouseStore';
export { useInventoryStore } from './inventoryStore';

// Re-export for backward compatibility
// Note: For new code, use individual stores (useMaterialsStore, useWarehouseStore, useInventoryStore)
// This wrapper combines all stores for backward compatibility
import { useMaterialsStore } from './materialsStore';
import { useWarehouseStore } from './warehouseStore';
import { useInventoryStore } from './inventoryStore';

/**
 * Combined store hook for backward compatibility
 * @deprecated Use useMaterialsStore, useWarehouseStore, useInventoryStore instead
 * This is kept for backward compatibility during migration
 */
export const useMaterialStore = <T = any>(selector?: (state: any) => T): T => {
    // Get state from each store
    const materials = useMaterialsStore(state => state.materials);
    const warehouseList = useWarehouseStore(state => state.warehouseList);
    const inventoryList = useInventoryStore(state => state.inventoryList);
    const searchText = useMaterialsStore(state => state.searchText);
    const filterGroup = useMaterialsStore(state => state.filterGroup);
    const filterType = useMaterialsStore(state => state.filterType);
    const filterMaterialName = useMaterialsStore(state => state.filterMaterialName);
    const isLoadingMaterials = useMaterialsStore(state => state.isLoadingMaterials);
    const materialsError = useMaterialsStore(state => state.materialsError);
    const materialGroups = useMaterialsStore(state => state.materialGroups);
    const materialTypes = useMaterialsStore(state => state.materialTypes);
    const units = useMaterialsStore(state => state.units);
    const isLoadingMaterialGroups = useMaterialsStore(state => state.isLoadingMaterialGroups);
    const isLoadingMaterialTypes = useMaterialsStore(state => state.isLoadingMaterialTypes);
    const isLoadingUnits = useMaterialsStore(state => state.isLoadingUnits);

    // Get actions from each store
    const fetchMaterials = useMaterialsStore(state => state.fetchMaterials);
    const fetchMaterialById = useMaterialsStore(state => state.fetchMaterialById);
    const createMaterial = useMaterialsStore(state => state.createMaterial);
    const updateMaterial = useMaterialsStore(state => state.updateMaterial);
    const deleteMaterial = useMaterialsStore(state => state.deleteMaterial);
    const addMaterial = useMaterialsStore(state => state.addMaterial);
    const getMaterialById = useMaterialsStore(state => state.getMaterialById);
    const getMaterials = useMaterialsStore(state => state.getMaterials);
    const fetchMaterialGroups = useMaterialsStore(state => state.fetchMaterialGroups);
    const getMaterialGroupOptions = useMaterialsStore(state => state.getMaterialGroupOptions);
    const fetchMaterialTypes = useMaterialsStore(state => state.fetchMaterialTypes);
    const fetchMaterialTypesByGroup = useMaterialsStore(state => state.fetchMaterialTypesByGroup);
    const getMaterialTypeOptions = useMaterialsStore(state => state.getMaterialTypeOptions);
    const getAllMaterialTypeOptions = useMaterialsStore(state => state.getAllMaterialTypeOptions);
    const fetchUnits = useMaterialsStore(state => state.fetchUnits);
    const getUnitOptions = useMaterialsStore(state => state.getUnitOptions);
    const setSearchText = useMaterialsStore(state => state.setSearchText);
    const setFilterGroup = useMaterialsStore(state => state.setFilterGroup);
    const setFilterType = useMaterialsStore(state => state.setFilterType);
    const setFilterMaterialName = useMaterialsStore(state => state.setFilterMaterialName);
    const resetFilters = useMaterialsStore(state => state.resetFilters);
    const addWarehouseReceipt = useWarehouseStore(state => state.addWarehouseReceipt);
    const getWarehouseReceipts = useWarehouseStore(state => state.getWarehouseReceipts);
    const addInventoryTicket = useInventoryStore(state => state.addInventoryTicket);
    const getInventoryTickets = useInventoryStore(state => state.getInventoryTickets);

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
