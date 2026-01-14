/**
 * @file materialFiltersStore.ts
 * @description UI State Store for Material filters (searchText, filterType, etc.)
 * @created 2025-01-XX
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MaterialFiltersState {
    // UI State (for MaterialScreen)
    searchText: string;
    filterGroup: string;
    filterType: string; // Material type name for filtering
    filterMaterialName: string | null;

    // Actions - Filters
    setSearchText: (text: string) => void;
    setFilterGroup: (group: string) => void;
    setFilterType: (type: string) => void;
    setFilterMaterialName: (name: string | null) => void;
    resetFilters: () => void;
}

export const useMaterialFiltersStore = create<MaterialFiltersState>()(
    persist(
        immer(set => ({
            // Initial state
            searchText: '',
            filterGroup: '',
            filterType: '',
            filterMaterialName: null,

            // Filter actions
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

            resetFilters: () =>
                set(state => {
                    state.searchText = '';
                    state.filterGroup = '';
                    state.filterType = '';
                    state.filterMaterialName = null;
                }),
        })),
        {
            name: 'material-filters-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
