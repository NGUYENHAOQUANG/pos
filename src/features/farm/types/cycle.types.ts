import type { IApiResponse, ICreatorEditor, IPaginate } from '@/shared/types/common.types';
import type { PondData } from '@/features/farm/types/pond.types';

export interface ICycleSeason {
    zoneId: string;
    name: string;
    code?: string;
    startDate: string;
    endDate?: string;
    status: string;
    notes?: string;
    id: string;
    no: number;
    creatorId?: string;
    editorId?: string;
    createdAt: string;
    editedAt: string;
    creator?: ICreatorEditor | null;
    editor?: ICreatorEditor | null;
}

export interface CycleData {
    warehouseItemId?: string;
    code?: string;
    name?: string;
    endDate?: string;
    status: string;
    notes?: string;
    density: number;
    totalStocking: number;
    ageDays: number;
    season: ICycleSeason;
    pond: PondData;
    id: string;
    no: number;
    creatorId?: string;
    editorId?: string;
    createdAt: string;
    editedAt: string;
    creator?: ICreatorEditor | null;
    editor?: ICreatorEditor | null;
}

export interface ICycleListParams {
    PondId?: string;
    Code?: string;
    Name?: string;
    Id?: string;
    CreatedAt?: string;
    CreateAtFrom?: string;
    CreateAtTo?: string;
    Page?: number;
    PageSize?: number;
    OrderBy?: string;
}

export interface ICreateCyclePayload {
    seasonId: string;
    warehouseItemId: string;
    name: string;
    totalStocking: number;
    ageDays: number;
    notes?: string;
}

export interface IUpdateCyclePayload {
    seasonId?: string;
    warehouseItemId?: string;
    name?: string;
    totalStocking?: number;
    ageDays?: number;
    notes?: string;
}

export type ICycleDetailResponse = IApiResponse<CycleData>;
export type ICycleListResponse = IApiResponse<IPaginate<CycleData>>;
