import { StateCreator } from 'zustand';
import { JobExecution } from '@/features/farm/types/farm.types';

export interface CleanPondSlice {
    cleanPondJobs: Record<string, JobExecution[]>;
    updateCleanPondJob: (pondId: string, items: JobExecution[]) => void;
}

export const createCleanPondSlice: StateCreator<
    CleanPondSlice,
    [['zustand/immer', never]],
    [],
    CleanPondSlice
> = set => ({
    cleanPondJobs: {},
    updateCleanPondJob: (pondId, items) =>
        set(state => {
            state.cleanPondJobs[pondId] = items;
        }),
});
