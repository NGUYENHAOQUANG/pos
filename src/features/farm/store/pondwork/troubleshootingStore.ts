import { StateCreator } from 'zustand';
import { JobExecution } from '@/features/farm/types/farm.types';
import { mockHandleProblemJobExecutions } from '@/features/farm/data/jobData';

export interface TroubleshootingSlice {
    troubleshootingJobs: Record<string, JobExecution[]>;
    updateTroubleshootingJob: (pondId: string, items: JobExecution[]) => void;
}

const initializeJobs = () => {
    const grouped: Record<string, JobExecution[]> = {};
    mockHandleProblemJobExecutions.forEach(execution => {
        if (execution.pondId) {
            if (!grouped[execution.pondId]) {
                grouped[execution.pondId] = [];
            }
            grouped[execution.pondId].push(execution);
        }
    });
    return grouped;
};

export const createTroubleshootingSlice: StateCreator<
    TroubleshootingSlice,
    [['zustand/immer', never]],
    [],
    TroubleshootingSlice
> = set => ({
    troubleshootingJobs: initializeJobs(),
    updateTroubleshootingJob: (pondId, items) =>
        set(state => {
            state.troubleshootingJobs[pondId] = items;
        }),
});
