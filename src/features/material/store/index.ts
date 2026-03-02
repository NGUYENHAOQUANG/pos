export { useMaterialsStore } from '@/features/material/store/materialsStore';

import { useMaterialsStore } from '@/features/material/store/materialsStore';

export const useMaterialStore = <T = any>(selector?: (state: any) => T): T => {
    // Get filters from materials store (merged)
    const searchText = useMaterialsStore(state => state.searchText);
    const filterGroup = useMaterialsStore(state => state.filterGroup);
    const filterType = useMaterialsStore(state => state.filterType);
    const filterMaterialName = useMaterialsStore(state => state.filterMaterialName);
    const selectedTab = useMaterialsStore(state => state.selectedTab);

    // Get filter actions
    const setSearchText = useMaterialsStore(state => state.setSearchText);
    const setFilterGroup = useMaterialsStore(state => state.setFilterGroup);
    const setFilterType = useMaterialsStore(state => state.setFilterType);
    const setFilterMaterialName = useMaterialsStore(state => state.setFilterMaterialName);
    const resetFilters = useMaterialsStore(state => state.resetFilters);
    const setSelectedTab = useMaterialsStore(state => state.setSelectedTab);
    const setImportReceiptStatusFilter = useMaterialsStore(
        state => state.setImportReceiptStatusFilter
    );
    const setExportReceiptStatusFilter = useMaterialsStore(
        state => state.setExportReceiptStatusFilter
    );
    const setInventoryStatusFilter = useMaterialsStore(state => state.setInventoryStatusFilter);
    const importReceiptStatusFilter = useMaterialsStore(state => state.importReceiptStatusFilter);
    const exportReceiptStatusFilter = useMaterialsStore(state => state.exportReceiptStatusFilter);
    const inventoryStatusFilter = useMaterialsStore(state => state.inventoryStatusFilter);

    // Get actions from each store

    const combinedState = {
        // UI State
        searchText,
        filterGroup,
        filterType,
        filterMaterialName,
        selectedTab,
        importReceiptStatusFilter,
        exportReceiptStatusFilter,
        inventoryStatusFilter,
        // Actions - Filters
        setSearchText,
        setFilterGroup,
        setFilterType,
        setFilterMaterialName,
        resetFilters,
        setSelectedTab,
        setImportReceiptStatusFilter,
        setExportReceiptStatusFilter,
        setInventoryStatusFilter,
    };

    if (selector) {
        return selector(combinedState) as T;
    }

    return combinedState as T;
};
