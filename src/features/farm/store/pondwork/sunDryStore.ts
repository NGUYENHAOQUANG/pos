import { StateCreator } from 'zustand';
import { JobExecution } from '@/features/farm/types/farm.types';

export interface SunDryStore {
    sunDryJobs: Record<string, JobExecution[]>;
    updateSunDryJob: (pondId: string, items: JobExecution[]) => void;
}

export const createSunDrySlice: StateCreator<
    SunDryStore,
    [['zustand/immer', never]],
    [],
    SunDryStore
> = set => ({
    sunDryJobs: {},
    updateSunDryJob: (pondId, items) =>
        set(state => {
            state.sunDryJobs[pondId] = items;
        }),
});
