import { StateCreator } from 'zustand';
import { JobExecution } from '@/features/farm/types/farm.types';
import { mockFeedJobExecutions } from '@/features/farm/data/jobData';

export interface FeedSlice {
    feedJobs: Record<string, JobExecution[]>;
    updateFeedJob: (pondId: string, items: JobExecution[]) => void;
}

const initializeFeedJobs = () => {
    const grouped: Record<string, JobExecution[]> = {};
    mockFeedJobExecutions.forEach(execution => {
        if (execution.pondId) {
            if (!grouped[execution.pondId]) {
                grouped[execution.pondId] = [];
            }
            grouped[execution.pondId].push(execution);
        }
    });
    return grouped;
};

export const createFeedSlice: StateCreator<
    FeedSlice,
    [['zustand/immer', never]],
    [],
    FeedSlice
> = set => ({
    feedJobs: initializeFeedJobs(),
    updateFeedJob: (pondId, items) =>
        set(state => {
            state.feedJobs[pondId] = items;
        }),
});
