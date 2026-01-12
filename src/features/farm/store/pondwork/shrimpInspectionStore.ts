import { StateCreator } from 'zustand';
import { JobExecution } from '@/features/farm/types/farm.types';
import { mockShrimpInspectionJobExecutions } from '@/features/farm/data/jobData';

export interface ShrimpInspectionSlice {
    shrimpInspectionJobs: Record<string, JobExecution[]>;
    updateShrimpInspectionJob: (pondId: string, items: JobExecution[]) => void;
}

const initializeJobs = () => {
    const grouped: Record<string, JobExecution[]> = {};
    mockShrimpInspectionJobExecutions.forEach(execution => {
        if (execution.pondId) {
            if (!grouped[execution.pondId]) {
                grouped[execution.pondId] = [];
            }
            grouped[execution.pondId].push(execution);
        }
    });
    return grouped;
};

export const createShrimpInspectionSlice: StateCreator<
    ShrimpInspectionSlice,
    [['zustand/immer', never]],
    [],
    ShrimpInspectionSlice
> = set => ({
    shrimpInspectionJobs: initializeJobs(),
    updateShrimpInspectionJob: (pondId, items) =>
        set(state => {
            state.shrimpInspectionJobs[pondId] = items;
        }),
});
