import { create } from 'zustand';
import {
    CreateEnvironmentSettingRequest,
    UpdateEnvironmentSettingRequest,
} from '@/features/farm/types/environmentSettings.types';

export type EnvironmentSettingInfo = {
    metricId: string;
    settingId?: string;
    data: CreateEnvironmentSettingRequest | UpdateEnvironmentSettingRequest;
    type: 'create' | 'update';
};

interface EnvironmentSettingStore {
    pendingChanges: Record<string, EnvironmentSettingInfo>;

    addChange: (metricId: string, change: EnvironmentSettingInfo) => void;
    removeChange: (metricId: string) => void;
    clearChanges: () => void;
    getChange: (metricId: string) => EnvironmentSettingInfo | undefined;
}

export const useEnvironmentSettingStore = create<EnvironmentSettingStore>((set, get) => ({
    pendingChanges: {},

    addChange: (metricId, change) =>
        set(state => ({
            pendingChanges: { ...state.pendingChanges, [metricId]: change },
        })),

    removeChange: metricId =>
        set(state => {
            const newChanges = { ...state.pendingChanges };
            delete newChanges[metricId];
            return { pendingChanges: newChanges };
        }),

    clearChanges: () => set({ pendingChanges: {} }),

    getChange: metricId => get().pendingChanges[metricId],
}));
