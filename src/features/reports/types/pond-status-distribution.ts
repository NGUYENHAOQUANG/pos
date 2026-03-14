import { IApiResponse } from '@/shared/types/common.types';

export interface PondStatusKPI {
    totalPonds: number;
    activePonds: number;
    availablePonds: number;
    functionalPonds: number;
    activePercentage: number;
}

export interface PondStatusByDate {
    date: string;
    functionalCount: number;
    availableCount: number;
    framingCount: number;
}

export interface PondStatusChange {
    changedAt: string;
    oldStatus: string | null;
    newStatus: string;
}

export interface PondStatusByPond {
    pondId: string;
    pondName: string;
    pondCode: string;
    currentStatus: string;
    statusChanges: PondStatusChange[];
}

export interface PondStatusDistributionData {
    kpis: PondStatusKPI;
    byDate: PondStatusByDate[];
    byPond: PondStatusByPond[];
}

export interface PondStatusDistributionParams {
    zoneId?: string;
    startDate?: string;
    endDate?: string;
}

export type PondStatusDistributionResponse = IApiResponse<PondStatusDistributionData>;
