import { StateCreator } from 'zustand';
import { JobExecution } from '@/features/farm/types/farm.types';
import { mockWaterSupplyJobExecutions } from '@/features/farm/data/jobData';

export interface WaterChangeSlice {
    waterChangeJobs: Record<string, JobExecution[]>;
    updateWaterChangeJob: (pondId: string, items: JobExecution[]) => void;
}

const initializeJobs = () => {
    const grouped: Record<string, JobExecution[]> = {};
    mockWaterSupplyJobExecutions.forEach(execution => {
        if (execution.pondId) {
            if (!grouped[execution.pondId]) {
                grouped[execution.pondId] = [];
            }
            grouped[execution.pondId].push(execution);
        }
    });
    return grouped;
};

export const createWaterChangeSlice: StateCreator<
    WaterChangeSlice,
    [['zustand/immer', never]],
    [],
    WaterChangeSlice
> = set => ({
    waterChangeJobs: initializeJobs(),
    updateWaterChangeJob: (pondId, items) =>
        set(state => {
            state.waterChangeJobs[pondId] = items;
        }),
});
