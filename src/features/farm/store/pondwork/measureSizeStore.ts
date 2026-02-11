import { StateCreator } from 'zustand';
import { JobExecution } from '@/features/farm/types/farm.types';

export interface AIMeasurementResult {
    averageSizeCm: number;
    sizePcsPerKg: number;
    aiCount: number;
    timestamp: number;
}

export interface MeasureSizeSlice {
    measureSizeJobs: Record<string, JobExecution[]>;
    latestAIMeasurement: Record<string, AIMeasurementResult>;
    updateMeasureSizeJob: (pondId: string, items: JobExecution[]) => void;
    setLatestAIMeasurement: (pondId: string, data: AIMeasurementResult) => void;
    clearLatestAIMeasurement: (pondId: string) => void;
}

export const createMeasureSizeSlice: StateCreator<
    MeasureSizeSlice,
    [['zustand/immer', never]],
    [],
    MeasureSizeSlice
> = set => ({
    measureSizeJobs: {},
    latestAIMeasurement: {},
    updateMeasureSizeJob: (pondId, items) =>
        set(state => {
            state.measureSizeJobs[pondId] = items;
        }),
    setLatestAIMeasurement: (pondId, data) =>
        set(state => {
            state.latestAIMeasurement[pondId] = data;
        }),
    clearLatestAIMeasurement: pondId =>
        set(state => {
            delete state.latestAIMeasurement[pondId];
        }),
});
