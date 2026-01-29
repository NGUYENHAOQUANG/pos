import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TabType } from '@/features/material/components/HeadingMaterial';

interface MaterialsState {
    // UI State (for MaterialScreen)
    selectedTab: TabType;
    searchText: string;
    filterGroup: string;
    filterType: string; // Material type name for filtering
    filterMaterialName: string | null;

    // Actions - Filters
    setSelectedTab: (tab: TabType) => void;
    setSearchText: (text: string) => void;
    setFilterGroup: (group: string) => void;
    setFilterType: (type: string) => void;
    setFilterMaterialName: (name: string | null) => void;
    resetFilters: () => void;
}

export const useMaterialsStore = create<MaterialsState>()(
    persist(
        immer(set => ({
            // Initial state
            selectedTab: 'list',
            searchText: '',
            filterGroup: '',
            filterType: '',
            filterMaterialName: null,

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

            resetFilters: () =>
                set(state => {
                    state.searchText = '';
                    state.filterGroup = '';
                    state.filterType = '';
                    state.filterMaterialName = null;
                }),
        })),
        {
            name: 'materials-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: state => ({
                // Persist only what's needed, usually UI filters might not need persistence across app restarts
                // unless desired. For now, we persist them as they were in the original file.
                // Or maybe we should NOT persist filters?
                // The original file persisted them. I'll keep persistence.
                searchText: state.searchText,
                filterGroup: state.filterGroup,
                filterType: state.filterType,
                selectedTab: state.selectedTab,
            }),
        }
    )
);
