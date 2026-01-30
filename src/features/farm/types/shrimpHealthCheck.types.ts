/**
 * Types for Shrimp Health Check API
 */

// Enums
export type LeftoverFeedEnum = 'None' | 'From5To10' | 'From10To15' | 'From15To20';
export type GutConditionEnum = 'Empty' | 'Full';
export type GutColorEnum = 'FeedColor' | 'Black' | 'Abnormal';
export type FecesColorEnum = 'FeedColor' | 'Abnormal';
export type LiverConditionEnum = 'Normal' | 'Abnormal';

// Request types
export interface ShrimpHealthCheckDetail {
    feedInTrapG: number;
    leftoverFeedPercent?: LeftoverFeedEnum;
    gutCondition?: GutConditionEnum;
    gutColor?: GutColorEnum;
    fecesColor?: FecesColorEnum;
    liverCondition?: LiverConditionEnum;
    notes?: string;
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

// Response types
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
    // New API format: list of document IDs associated with this health check
    documentIds?: string[];
    documents?: Array<{
        id: string;
        fileName: string;
        filePath: string;
        publicUrl?: string;
    }>;
    healthCheck?: ShrimpHealthCheckDetailDto;
}
