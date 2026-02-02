import {
    IApiResponse,
    IPaginate,
    PaginationParams,
    IDocument,
    ICreatorEditor,
} from '@/shared/types/common.types';

export interface IDryRenovationMaterial {
    warehouseItemId: string;
    quantity: number;
}

export interface IDryRenovationDetail {
    materials?: IDryRenovationMaterial[];
    notes?: string;
}

export interface IDryRenovation {
    id: string;
    no: number;
    createdAt: string;
    editedAt?: string;
    creator?: ICreatorEditor;
    editor?: ICreatorEditor;
    pondId: string;
    dryRenovationDetail?: IDryRenovationDetail;
    documentIds?: string[];
    documents?: IDocument[];
}

export interface ICreateDryRenovationReq {
    pondId: string;
    documentIds?: string[];
    dryRenovationDetail?: IDryRenovationDetail;
}

export interface IUpdateDryRenovationReq {
    id: string;
    documentIds?: string[];
    dryRenovationDetail?: IDryRenovationDetail;
}

export interface IDryRenovationParams extends PaginationParams {
    pondId?: string;
    id?: string;
    createdAt?: string;
    createAtFrom?: string;
    createAtTo?: string;
    orderBy?: string;
}

export type IDryRenovationResponse = IApiResponse<IPaginate<IDryRenovation>>;
export type IDryRenovationDetailResponse = IApiResponse<IDryRenovation>;
export type IDryRenovationCreateResponse = IApiResponse<string>;
export type IDryRenovationUpdateResponse = IApiResponse<string>;
export type IDryRenovationDeleteResponse = IApiResponse<boolean>;
