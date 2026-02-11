import { IApiResponse, IPaginate, IDocument } from '@/shared/types/common.types';
export interface ISizeMeasurementDetail {
    shrimpSizePcsPerKg: number;
    estimatedRemainingStockKg: number;
    totalShrimpCount?: number;
    survivalRatePercentage?: number;
    averageShrimpSize?: number;
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
    documents?: IDocument[];
    sizeMeasurement?: ISizeMeasurementDetail | null;
    sizeMeasurementDetail?: ISizeMeasurementDetail | null;
}

export interface ICreateSizeMeasurementReq {
    documentIds?: string[] | null;
    sizeMeasurementDetail: {
        shrimpSizePcsPerKg: number;
        estimatedRemainingStockKg: number;
        averageShrimpSize?: number;
        notes?: string | null;
    };
}

export interface IUpdateSizeMeasurementReq {
    documentIds?: string[] | null;
    sizeMeasurementDetail: {
        shrimpSizePcsPerKg: number;
        estimatedRemainingStockKg: number;
        averageShrimpSize?: number;
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
