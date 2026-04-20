import { IApiResponse, IPaginate, IDocument, ICreatorEditor } from '@/shared/types/common.types';

export type HarvestType = 'FullHarvest' | 'PartialHarvest';

export enum HarvestScaleMode {
    MANUAL = 'MANUAL',
    AUTO = 'AUTO',
}

export enum ScaleSessionAction {
    ACTIVE = 'ACTIVE',
    FINISH = 'FINISH',
    DELETE = 'DELETE',
}

export enum HarvestFilterType {
    ALL = 'all',
    COMPLETED = 'completed',
    DELETED = 'deleted',
}

export interface IHarvestDetail {
    harvestType: HarvestType;
    totalWeightKg: number;
    shrimpSize: number;
    referencePrice: number;
    revenue: number;
    notes?: string | null;
}

export interface IHarvestRecord {
    id: string;
    no?: number;
    creatorId?: string;
    editorId?: string;
    createdAt?: string;
    editedAt?: string;
    creator?: ICreatorEditor;
    editor?: ICreatorEditor;
    pondId?: string;
    cycleId?: string;
    operationId?: string;
    value?: number;
    documentIds?: string[];
    documents?: IDocument[];
    harvest?: IHarvestDetail | null;
    harvestDetail?: IHarvestDetail | null;
}

export interface IHarvestInput {
    harvestType: HarvestType;
    totalWeightKg: number;
    shrimpSize: number;
    referencePrice: number;
    revenue: number;
    notes?: string | null;
}

export interface ICreateHarvestRecordReq {
    value: number;
    harvest: IHarvestInput;
}

export interface IUpdateHarvestRecordReq {
    value?: number;
    documentIds?: string[];
    harvest?: IHarvestInput;
}

export interface IHarvestRecordParams {
    PondId?: string;
    CycleId?: string;
    HarvestType?: HarvestType;
    Id?: string;
    CreatedAt?: string;
    CreateAtFrom?: string;
    CreateAtTo?: string;
    Page?: number;
    PageSize?: number;
    OrderBy?: string;
}

export type GetHarvestRecordsResponse = IApiResponse<IPaginate<IHarvestRecord>>;
export type HarvestRecordResponse = IApiResponse<IHarvestRecord>;
export type DeleteHarvestRecordResponse = IApiResponse<string>;
