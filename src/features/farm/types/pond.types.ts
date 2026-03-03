import { IApiResponse, IPaginate, ICreatorEditor } from '@/shared/types/common.types';
import { OperationType, PondType, PondTypeOperation } from '@/features/farm/types/farm.types';

export interface PondData {
    id: string;
    code?: string;
    name: string;
    no?: number;
    area?: number | string;
    areaSqm?: number;
    shape?: string;
    depth?: string | number;
    maxDepth?: number;
    pondPhase?: string;
    status?: string | PondStatus;
    pondCategoryId?: string;
    type?: PondType;
    zoneId?: string;
    farmCode?: string;
    zone?: string;
    lastUpdate?: string;
    lastActivity?: string;
    creatorId?: string;
    editorId?: string | null;
    createdAt?: string;
    editedAt?: string;
    creator?: ICreatorEditor | null;
    editor?: ICreatorEditor | null;
}

export enum PondStatus {
    Available = 'Available',
    Framing = 'Framing',
    Null = 'Null',
}

export interface GetPondsParams {
    ZoneId?: string;
    PondCategoryId?: string;
    Name?: string;
    Status?: PondStatus;
    Id?: string;
    CreatedAt?: string;
    CreateAtFrom?: string;
    CreateAtTo?: string;
    Page?: number;
    PageSize?: number;
    OrderBy?: string;
}

export type GetPondsResponse = IApiResponse<IPaginate<PondData>>;
export type GetPondTypesResponse = IApiResponse<PondType[]>;
export type GetPondOperationTypesResponse = IApiResponse<OperationType[]>;
export type GetPondTypeOperationsResponse = IApiResponse<PondTypeOperation[]>;
export type GetPondByIdResponse = IApiResponse<PondData>;
