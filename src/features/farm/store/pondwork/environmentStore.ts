import { StateCreator } from 'zustand';
import { JobExecution } from '@/features/farm/types/farm.types';

export interface EnvironmentSlice {
    environmentJobs: Record<string, JobExecution[]>;
    updateEnvironmentJob: (pondId: string, items: JobExecution[]) => void;
}

export const createEnvironmentSlice: StateCreator<
    EnvironmentSlice,
    [['zustand/immer', never]],
    [],
    EnvironmentSlice
> = set => ({
    environmentJobs: {},
    updateEnvironmentJob: (pondId, items) =>
        set(state => {
            state.environmentJobs[pondId] = items;
        }),
});
