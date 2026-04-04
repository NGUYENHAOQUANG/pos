import type { ICreatorEditor, PondLogMaterialType } from '@/shared/types/common.types';

export interface ISiphonDetail {
    shrimpLossKg?: number;
    notes?: string;
    materials?: PondLogMaterialType[];
}

export interface ISiphonRecord {
    id: string;
    no?: number;
    createdAt?: string;
    editor?: ICreatorEditor;
    creator?: ICreatorEditor;
    pondId: string;
    documentIds?: string[];
    value?: number;
    siphonDetail?: ISiphonDetail;
}

export interface ISiphonRecordResponse {
    items: ISiphonRecord[];
    totalCount: number;
}

export interface ISiphonParams {
    Page?: number;
    PageSize?: number;
    CreatedAdmin?: boolean; // mirrors sizeMeasurement params if exists
    // Add other params if needed
}

export interface ICreateSiphonDetail {
    shrimpLossKg: number;
    notes: string;
    materials: PondLogMaterialType[];
}

export interface CreateSiphonCommand {
    value: number;
    documentIds: string[];
    siphonDetail: ICreateSiphonDetail;
}
