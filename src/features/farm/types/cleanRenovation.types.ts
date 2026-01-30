import { IApiResponse, IPaginate, PaginationParams, IDocument } from '@/shared/types/common.types';

export interface ICleanRenovationMaterial {
    warehouseItemId: string;
    quantity: number;
}

export interface ICleanRenovationDetail {
    materials?: ICleanRenovationMaterial[];
    notes?: string;
}

export interface ICleanRenovation {
    id: string;
    no: number;
    createdAt: string;
    editedAt?: string;
    creator?: any;
    editor?: any;
    pondId: string;
    detail?: ICleanRenovationDetail;
    documentIds?: string[];
    documents?: IDocument[];
}

export interface ICreateCleanRenovationReq {
    pondId: string;
    documentIds?: string[];
    cleanRenovationDetail?: ICleanRenovationDetail;
}

export interface IUpdateCleanRenovationReq {
    id: string;
    documentIds?: string[];
    cleanRenovationDetail?: ICleanRenovationDetail;
}

export interface ICleanRenovationParams extends PaginationParams {
    pondId?: string;
    id?: string;
    createdAt?: string;
    createAtFrom?: string;
    createAtTo?: string;
    orderBy?: string;
}

export type ICleanRenovationResponse = IApiResponse<IPaginate<ICleanRenovation>>;
export type ICleanRenovationDetailResponse = IApiResponse<ICleanRenovation>;
export type ICleanRenovationCreateResponse = IApiResponse<string>;
export type ICleanRenovationUpdateResponse = IApiResponse<string>;
export type ICleanRenovationDeleteResponse = IApiResponse<boolean>;
