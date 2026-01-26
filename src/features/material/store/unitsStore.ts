/**
 * @file unitsStore.ts
 * @description Units Store - Zustand store for client state management
 * @note Server state is managed by React Query hooks. This store manages client state.
 */
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface UnitsState {
    // Client state
    selectedUnitId: string | null;
    selectedUnitName: string | null;

    // Actions
    setSelectedUnit: (unitId: string | null, unitName: string | null) => void;
    clearSelection: () => void;
}

export const useUnitsStore = create<UnitsState>()(
    immer(set => ({
        // Initial state
        selectedUnitId: null,
        selectedUnitName: null,

        // Actions
        setSelectedUnit: (unitId, unitName) => {
            set(state => {
                state.selectedUnitId = unitId;
                state.selectedUnitName = unitName;
            });
        },

        clearSelection: () => {
            set(state => {
                state.selectedUnitId = null;
                state.selectedUnitName = null;
            });
        },
    }))
);
