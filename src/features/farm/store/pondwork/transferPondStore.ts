import { StateCreator } from 'zustand';
import { JobExecution } from '@/features/farm/types/farm.types';
import { mockTransferJobExecutions } from '@/features/farm/data/jobData';

export interface TransferPondSlice {
    transferPondJobs: Record<string, JobExecution[]>;
    updateTransferPondJob: (pondId: string, items: JobExecution[]) => void;
}

const initializeJobs = () => {
    const grouped: Record<string, JobExecution[]> = {};
    mockTransferJobExecutions.forEach(execution => {
        if (execution.pondId) {
            if (!grouped[execution.pondId]) {
                grouped[execution.pondId] = [];
            }
            grouped[execution.pondId].push(execution);
        }
    });
    return grouped;
};

export const createTransferPondSlice: StateCreator<
    TransferPondSlice,
    [['zustand/immer', never]],
    [],
    TransferPondSlice
> = set => ({
    transferPondJobs: initializeJobs(),
    updateTransferPondJob: (pondId, items) =>
        set(state => {
            state.transferPondJobs[pondId] = items;
        }),
});
