/**
 * @file envMeasurement.types.ts
 * @description Types for Environment Measurement API
 */

export interface IEnvMeasurementDetail {
    metricId: string;
    value: number;
    alertNote?: string;
    isAlerted?: boolean;
}

export interface ICreateEnvMeasurementReq {
    documentIds?: string[];
    envMeasurementDetail: {
        envMeasurementDetails: IEnvMeasurementDetail[];
        notes?: string;
    };
}

export interface IUpdateEnvMeasurementReq {
    documentIds?: string[];
    envMeasurementDetail: {
        envMeasurementDetails: IEnvMeasurementDetail[];
        notes?: string;
    };
}

export interface IEnvMeasurementParams {
    Page?: number;
    PageSize?: number;
    CreatedAt?: string;
    CreateAtFrom?: string;
    CreateAtTo?: string;
}

export interface EnvMeasurementResponse {
    data: {
        id: string;
        no: number;
        createdAt: string;
        editedAt: string;
        creator: any;
        editor: any;
        pondId: string;
        operationId: string;
        documentIds?: string[];
        envMeasurementDetail: {
            envMeasurementDetails: IEnvMeasurementDetail[];
            notes?: string;
        };
    };
}

export interface GetEnvMeasurementsResponse {
    data: {
        items: EnvMeasurementResponse['data'][];
        pageNumber: number;
        totalPages: number;
        totalCount: number;
    };
}

export interface EnvCreateUpdateResponse {
    data: {
        recordId: string;
    };
}
