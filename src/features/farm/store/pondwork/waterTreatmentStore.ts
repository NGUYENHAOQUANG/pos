import { StateCreator } from 'zustand';
import { JobExecution } from '@/features/farm/types/farm.types';
import { mockWaterTreatmentJobExecutions } from '@/features/farm/data/jobData';

export interface WaterTreatmentSlice {
    waterTreatmentJobs: Record<string, JobExecution[]>;
    updateWaterTreatmentJob: (pondId: string, items: JobExecution[]) => void;
}

const initializeJobs = () => {
    const grouped: Record<string, JobExecution[]> = {};
    mockWaterTreatmentJobExecutions.forEach(execution => {
        if (execution.pondId) {
            if (!grouped[execution.pondId]) {
                grouped[execution.pondId] = [];
            }
            grouped[execution.pondId].push(execution);
        }
    });
    return grouped;
};

export const createWaterTreatmentSlice: StateCreator<
    WaterTreatmentSlice,
    [['zustand/immer', never]],
    [],
    WaterTreatmentSlice
> = set => ({
    waterTreatmentJobs: initializeJobs(),
    updateWaterTreatmentJob: (pondId, items) =>
        set(state => {
            state.waterTreatmentJobs[pondId] = items;
        }),
});
