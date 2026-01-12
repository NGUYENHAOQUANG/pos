import { StateCreator } from 'zustand';
import { JobExecution } from '@/features/farm/types/farm.types';
import { mockMeasureSizeJobExecutions } from '@/features/farm/data/jobData';

export interface MeasureSizeSlice {
    measureSizeJobs: Record<string, JobExecution[]>;
    updateMeasureSizeJob: (pondId: string, items: JobExecution[]) => void;
}

const initializeJobs = () => {
    const grouped: Record<string, JobExecution[]> = {};
    mockMeasureSizeJobExecutions.forEach(execution => {
        if (execution.pondId) {
            if (!grouped[execution.pondId]) {
                grouped[execution.pondId] = [];
            }
            grouped[execution.pondId].push(execution);
        }
    });
    return grouped;
};

export const createMeasureSizeSlice: StateCreator<
    MeasureSizeSlice,
    [['zustand/immer', never]],
    [],
    MeasureSizeSlice
> = set => ({
    measureSizeJobs: initializeJobs(),
    updateMeasureSizeJob: (pondId, items) =>
        set(state => {
            state.measureSizeJobs[pondId] = items;
        }),
});
