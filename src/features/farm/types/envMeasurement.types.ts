import { IApiResponse, IPaginate, ICreatorEditor } from '@/shared/types/common.types';
export interface IEnvMeasurementDetail {
    metricId: string;
    value: number;
    alertNote?: string;
    isAlerted?: boolean;
}

export interface IEnvMeasurementData {
    envMeasurementDetails: IEnvMeasurementDetail[];
    notes?: string;
}

export interface IEnvMeasurement {
    id: string;
    no: number;
    createdAt: string;
    editedAt: string;
    creator: ICreatorEditor | null;
    editor: ICreatorEditor | null;
    pondId: string;
    operationId: string;
    documentIds?: string[];
    envMeasurementDetail: IEnvMeasurementData;
}

export interface ICreateEnvMeasurementReq {
    documentIds?: string[];
    envMeasurementDetail: IEnvMeasurementData;
}

export type IUpdateEnvMeasurementReq = ICreateEnvMeasurementReq;

export interface IEnvMeasurementParams {
    PondId?: string;
    Id?: string;
    Page?: number;
    PageSize?: number;
    CreatedAt?: string;
    CreateAtFrom?: string;
    CreateAtTo?: string;
    OrderBy?: string;
}

// --- Response Types ---

export type EnvMeasurementResponse = IApiResponse<IEnvMeasurement>;
export type GetEnvMeasurementsResponse = IApiResponse<IPaginate<IEnvMeasurement>>;
export type EnvCreateUpdateResponse = IApiResponse<{ recordId: string }>;

/** Metric code/ID → limit string (e.g. "7.5 - 8.5") */
export interface IParameterLimits {
    [metricKey: string]: string;
}
