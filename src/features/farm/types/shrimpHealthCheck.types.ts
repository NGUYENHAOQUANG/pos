import type { IDocument } from '@/shared/types/common.types';

export type LeftoverFeedEnum = 'None' | 'From5To10' | 'From10To15' | 'From15To20';
export type GutConditionEnum = 'Empty' | 'Full';
export type GutColorEnum = 'FeedColor' | 'Black' | 'Abnormal';
export type FecesColorEnum = 'FeedColor' | 'Abnormal';
export type LiverConditionEnum = 'Normal' | 'Abnormal';
export interface ShrimpHealthCheckDetail {
    feedInTrapG: number;
    leftoverFeedPercent?: LeftoverFeedEnum;
    gutCondition?: GutConditionEnum;
    gutColor?: GutColorEnum;
    fecesColor?: FecesColorEnum;
    liverCondition?: LiverConditionEnum;
    notes?: string;
    averageInfectionRate?: number;
    isHealthy?: boolean;
    diagnosisDetails?: Array<{
        diseaseType: string;
        probabilityPercent: number;
    }>;
}

export interface CreateShrimpHealthCheckPayload {
    value: number;
    documentIds?: string[];
    healthCheck?: ShrimpHealthCheckDetail;
}

export interface UpdateShrimpHealthCheckPayload {
    value: number;
    documentIds?: string[];
    healthCheck?: ShrimpHealthCheckDetail;
}
export interface Creator {
    id: string;
    fullname: string;
    email: string;
    phoneNumber?: string;
    avatar?: string;
    createdAt: string;
    editedAt: string;
}

export interface ShrimpHealthCheckResult {
    id: string;
    no: number;
    createdAt: string;
    editedAt: string;
    creator?: Creator;
    editor?: Creator;
    shrimpHealthCheckId: string;
}

export interface ShrimpHealthCheckDetailDto {
    feedInTrapG: number;
    leftoverFeedPercent?: LeftoverFeedEnum;
    gutCondition?: GutConditionEnum;
    gutColor?: GutColorEnum;
    fecesColor?: FecesColorEnum;
    liverCondition?: LiverConditionEnum;
    notes?: string;
    averageInfectionRate?: number;
    isHealthy?: boolean;
    diagnosisDetails?: Array<{
        diseaseType: string;
        probabilityPercent: number;
    }>;
}

export interface ShrimpHealthCheckDto {
    id: string;
    no: number;
    value: number;
    createdAt: string;
    editedAt: string;
    creator?: Creator;
    editor?: Creator;
    pondId: string;
    cycleId?: string;
    documents?: IDocument[];
    healthCheck?: ShrimpHealthCheckDetailDto;
}
