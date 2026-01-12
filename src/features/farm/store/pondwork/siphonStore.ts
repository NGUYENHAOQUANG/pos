import { StateCreator } from 'zustand';
import { JobExecution } from '@/features/farm/types/farm.types';
import { mockSiphonJobExecutions } from '@/features/farm/data/jobData';

export interface SiphonSlice {
    siphonJobs: Record<string, JobExecution[]>;
    updateSiphonJob: (pondId: string, items: JobExecution[]) => void;
}

const initializeJobs = () => {
    const grouped: Record<string, JobExecution[]> = {};
    mockSiphonJobExecutions.forEach(execution => {
        if (execution.pondId) {
            if (!grouped[execution.pondId]) {
                grouped[execution.pondId] = [];
            }
            grouped[execution.pondId].push(execution);
        }
    });
    return grouped;
};

export const createSiphonSlice: StateCreator<
    SiphonSlice,
    [['zustand/immer', never]],
    [],
    SiphonSlice
> = set => ({
    siphonJobs: initializeJobs(),
    updateSiphonJob: (pondId, items) =>
        set(state => {
            state.siphonJobs[pondId] = items;
        }),
});
