import type { PondLogMaterialType } from '@/shared/types/common.types';

export enum TreatmentTypeEnum {
    MineralTreatment = 'MineralTreatment',
    ProbioticTreatment = 'ProbioticTreatment',
    Disinfection = 'Disinfection',
}

export const TREATMENT_TYPE_LABELS: Record<TreatmentTypeEnum, string> = {
    [TreatmentTypeEnum.MineralTreatment]: 'Đánh khoáng',
    [TreatmentTypeEnum.ProbioticTreatment]: 'Đánh vi sinh',
    [TreatmentTypeEnum.Disinfection]: 'Kiểm khuẩn',
};

/** Map Vietnamese display labels back to TreatmentTypeEnum */
export const TREATMENT_LABEL_TO_ENUM: Record<string, TreatmentTypeEnum> = {
    'Đánh khoáng': TreatmentTypeEnum.MineralTreatment,
    'Đánh vi sinh': TreatmentTypeEnum.ProbioticTreatment,
    'Kiểm khuẩn': TreatmentTypeEnum.Disinfection,
};

/** Get all treatment type options as string labels */
export const TREATMENT_TYPE_OPTIONS = Object.values(TREATMENT_TYPE_LABELS);

// --- Request DTOs ---

/** Detail payload for CreateWaterTreatment */
export interface IWaterTreatmentDetailReq {
    treatmentType: TreatmentTypeEnum;
    materials: PondLogMaterialType[];
    notes?: string;
}

/** Create water treatment command (POST body) */
export interface CreateWaterTreatmentCommand {
    documentIds?: string[];
    waterTreatmentDetail: IWaterTreatmentDetailReq;
}

/** Detail payload for UpdateWaterTreatment */
export interface IWaterTreatmentDetailUpdateReq {
    treatmentType?: TreatmentTypeEnum;
    materials?: PondLogMaterialType[];
    notes?: string;
}

/** Update water treatment command (PATCH body) */
export interface UpdateWaterTreatmentCommand {
    documentIds?: string[];
    waterTreatmentDetail: IWaterTreatmentDetailUpdateReq;
}

// --- Response DTOs ---

/** Account creator info in response */
export interface IAccountCreator {
    fullName?: string;
}

/** Detail object in WaterTreatmentDto response */
export interface IWaterTreatmentDetailRes {
    treatmentType: TreatmentTypeEnum;
    notes?: string;
    materials?: PondLogMaterialType[];
}

/** Single water treatment record (GET response) */
export interface IWaterTreatmentRecord {
    id: string;
    no?: number;
    creatorId?: string;
    editorId?: string;
    createdAt?: string;
    editedAt?: string;
    creator?: IAccountCreator;
    editor?: IAccountCreator;
    pondId: string;
    operationId?: string;
    documentIds?: string[];
    waterTreatmentDetail?: IWaterTreatmentDetailRes;
}

/** Paginated list response */
export interface IWaterTreatmentListResponse {
    items: IWaterTreatmentRecord[];
    totalCount: number;
    pageNumber?: number;
    totalPages?: number;
    hasPreviousPage?: boolean;
    hasNextPage?: boolean;
}

/** Query params for GET list */
export interface IWaterTreatmentParams {
    Page?: number;
    PageSize?: number;
    OrderBy?: string;
    CreatedAt?: string;
    CreateAtFrom?: string;
    CreateAtTo?: string;
}

/** Create result response */
export interface ICreateWaterTreatmentResult {
    recordId: string;
}

/** Update result response */
export interface IUpdateWaterTreatmentResult {
    recordId: string;
}
