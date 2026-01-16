/**
 * @file materialGroupsStore.ts
 * @description Material Groups Store - Zustand store for client state management
 * @note Server state is managed by React Query hooks. This store manages client state.
 */
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface MaterialGroupsState {
    // Client state
    selectedGroupId: number | null;
    selectedGroupName: string | null;

    // Actions
    setSelectedGroup: (groupId: number | null, groupName: string | null) => void;
    clearSelection: () => void;
}

export const useMaterialGroupsStore = create<MaterialGroupsState>()(
    immer(set => ({
        // Initial state
        selectedGroupId: null,
        selectedGroupName: null,

        // Actions
        setSelectedGroup: (groupId, groupName) => {
            set(state => {
                state.selectedGroupId = groupId;
                state.selectedGroupName = groupName;
            });
        },

        clearSelection: () => {
            set(state => {
                state.selectedGroupId = null;
                state.selectedGroupName = null;
            });
        },
    }))
);
