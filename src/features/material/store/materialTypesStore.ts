/**
 * @file materialTypesStore.ts
 * @description Material Types Store - Zustand store for client state management
 * @note Server state is managed by React Query hooks. This store manages client state.
 */
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface MaterialTypesState {
    // Client state
    selectedTypeId: number | null;
    selectedTypeName: string | null;

    // Actions
    setSelectedType: (typeId: number | null, typeName: string | null) => void;
    clearSelection: () => void;
}

export const useMaterialTypesStore = create<MaterialTypesState>()(
    immer(set => ({
        // Initial state
        selectedTypeId: null,
        selectedTypeName: null,

        // Actions
        setSelectedType: (typeId, typeName) => {
            set(state => {
                state.selectedTypeId = typeId;
                state.selectedTypeName = typeName;
            });
        },

        clearSelection: () => {
            set(state => {
                state.selectedTypeId = null;
                state.selectedTypeName = null;
            });
        },
    }))
);
