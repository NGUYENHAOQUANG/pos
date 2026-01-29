import { StateCreator } from 'zustand';
import { JobExecution } from '@/features/farm/types/farm.types';

export interface MeasureSizeSlice {
    measureSizeJobs: Record<string, JobExecution[]>;
    updateMeasureSizeJob: (pondId: string, items: JobExecution[]) => void;
}

export const createMeasureSizeSlice: StateCreator<
    MeasureSizeSlice,
    [['zustand/immer', never]],
    [],
    MeasureSizeSlice
> = set => ({
    measureSizeJobs: {},
    updateMeasureSizeJob: (pondId, items) =>
        set(state => {
            state.measureSizeJobs[pondId] = items;
        }),
});
