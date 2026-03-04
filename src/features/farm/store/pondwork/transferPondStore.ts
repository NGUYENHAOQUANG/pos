import { StateCreator } from 'zustand';
import { JobExecution } from '@/features/farm/types/farm.types';

export interface TransferPondSlice {
    transferPondJobs: Record<string, JobExecution[]>;
    updateTransferPondJob: (pondId: string, items: JobExecution[]) => void;
}

export const createTransferPondSlice: StateCreator<
    TransferPondSlice,
    [['zustand/immer', never]],
    [],
    TransferPondSlice
> = set => ({
    transferPondJobs: {},
    updateTransferPondJob: (pondId, items) =>
        set(state => {
            state.transferPondJobs[pondId] = items;
        }),
});
