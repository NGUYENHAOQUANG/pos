import { StateCreator } from 'zustand';
import { JobExecution } from '@/features/farm/types/farm.types';
import { mockHarvestJobExecutions } from '@/features/farm/data/jobData';

export interface HarvestSlice {
    harvestJobs: Record<string, JobExecution[]>;
    updateHarvestJob: (pondId: string, items: JobExecution[]) => void;
}

const initializeJobs = () => {
    const grouped: Record<string, JobExecution[]> = {};
    mockHarvestJobExecutions.forEach(execution => {
        if (execution.pondId) {
            if (!grouped[execution.pondId]) {
                grouped[execution.pondId] = [];
            }
            grouped[execution.pondId].push(execution);
        }
    });
    return grouped;
};

export const createHarvestSlice: StateCreator<
    HarvestSlice,
    [['zustand/immer', never]],
    [],
    HarvestSlice
> = set => ({
    harvestJobs: initializeJobs(),
    updateHarvestJob: (pondId, items) =>
        set(state => {
            state.harvestJobs[pondId] = items;
        }),
});
