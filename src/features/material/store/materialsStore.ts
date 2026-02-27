import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { TabType } from '@/features/material/components/HeadingMaterial';

interface MaterialsState {
    // UI State (for MaterialScreen)
    selectedTab: TabType;
    searchText: string;
    filterGroup: string;
    filterType: string; // Material type name for filtering
    filterMaterialName: string | null;
    importReceiptStatusFilter: string;
    exportReceiptStatusFilter: string;
    inventoryStatusFilter: string;

    // Actions - Filters
    setSelectedTab: (tab: TabType) => void;
    setSearchText: (text: string) => void;
    setFilterGroup: (group: string) => void;
    setFilterType: (type: string) => void;
    setFilterMaterialName: (name: string | null) => void;
    setImportReceiptStatusFilter: (status: string) => void;
    setExportReceiptStatusFilter: (status: string) => void;
    setInventoryStatusFilter: (status: string) => void;
    resetFilters: () => void;
}

export const useMaterialsStore = create<MaterialsState>()(
    immer(set => ({
        // Initial state
        selectedTab: TabType.Material,
        searchText: '',
        filterGroup: '',
        filterType: '',
        filterMaterialName: null,
        importReceiptStatusFilter: '',
        exportReceiptStatusFilter: '',
        inventoryStatusFilter: '',

        // Filter actions
        setSelectedTab: (tab: TabType) =>
            set(state => {
                state.selectedTab = tab;
            }),

        setSearchText: (text: string) =>
            set(state => {
                state.searchText = text;
            }),

        setFilterGroup: (group: string) =>
            set(state => {
                state.filterGroup = group;
            }),

        setFilterType: (type: string) =>
            set(state => {
                state.filterType = type;
            }),

        setFilterMaterialName: (name: string | null) =>
            set(state => {
                state.filterMaterialName = name;
            }),

        setImportReceiptStatusFilter: (status: string) =>
            set(state => {
                state.importReceiptStatusFilter = status;
            }),

        setExportReceiptStatusFilter: (status: string) =>
            set(state => {
                state.exportReceiptStatusFilter = status;
            }),

        setInventoryStatusFilter: (status: string) =>
            set(state => {
                state.inventoryStatusFilter = status;
            }),

        resetFilters: () =>
            set(state => {
                state.searchText = '';
                state.filterGroup = '';
                state.filterType = '';
                state.filterMaterialName = null;
                state.importReceiptStatusFilter = '';
                state.exportReceiptStatusFilter = '';
                state.inventoryStatusFilter = '';
            }),
    }))
);
