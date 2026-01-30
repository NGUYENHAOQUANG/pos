import { IApiResponse, IPaginate } from '@/shared/types/common.types';
export interface ISizeMeasurementDetail {
    shrimpSizePcsPerKg: number;
    estimatedRemainingStockKg: number;
    totalShrimpCount?: number;
    survivalRatePercentage?: number;
    releaseQuantity?: number;
    notes?: string | null;
}

export interface ISizeMeasurement {
    id: string;
    no?: number;
    createdAt?: string;
    editedAt?: string;
    creator?: any;
    editor?: any;
    pondId?: string;
    operationId?: string;
    value?: number;
    documentIds?: string[];
    documents?: Array<{
        id: string;
        fileName: string;
        filePath: string;
        publicUrl?: string;
    }>;
    sizeMeasurement?: ISizeMeasurementDetail | null;
}

export interface ICreateSizeMeasurementReq {
    documentIds?: string[] | null;
    sizeMeasurement: {
        shrimpSizePcsPerKg: number;
        estimatedRemainingStockKg: number;
        notes?: string | null;
    };
}

export interface IUpdateSizeMeasurementReq {
    value?: number | null;
    documentIds?: string[] | null;
    sizeMeasurement: {
        shrimpSizePcsPerKg: number;
        estimatedRemainingStockKg: number;
        notes?: string | null;
    };
}

export interface ISizeMeasurementParams {
    PondId?: string;
    Id?: string;
    CreatedAt?: string;
    CreateAtFrom?: string;
    CreateAtTo?: string;
    Page?: number;
    PageSize?: number;
    OrderBy?: string;
}

export type GetSizeMeasurementsResponse = IApiResponse<IPaginate<ISizeMeasurement>>;
export type SizeMeasurementResponse = IApiResponse<ISizeMeasurement>;
