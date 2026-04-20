import { IApiResponse, IPaginate } from '@/shared/types/common.types';

export interface IStartScaleSessionRequest {
    cycleId: string;
}

export interface IStartScaleSessionData {
    sessionId: string;
}

export type StartScaleSessionResponse = IApiResponse<IStartScaleSessionData>;

export interface IScaleRecordParams {
    SearchText?: string;
    CycleId?: string;
    ScaleId?: string;
    RecordId?: string;
    ZoneId?: string;
    SessionId?: string;
    ConfirmedBy?: string;
    Status?: string;
    BatchNoFrom?: number;
    BatchNoTo?: number;
    WeightFrom?: number;
    WeightTo?: number;
    DeviceTimestampFrom?: string;
    DeviceTimestampTo?: string;
    ConfirmedAtFrom?: string;
    ConfirmedAtTo?: string;
    Id?: string;
    CreatedAt?: string;
    CreateAtFrom?: string;
    CreateAtTo?: string;
    Page?: number;
    PageSize?: number;
    OrderBy?: string;
}

export interface IConfirmScaleRecordRequest {
    cycleId: string;
    scaleId: string;
    sessionId: string;
    weight: number;
    deviceTimestamp: string;
}

export interface IFinishScaleSessionRequest {
    sessionId: string;
    cycleId: string;
}

export interface IDiscardScaleSessionRequest {
    sessionId: string;
}

export interface IScaleRecord {
    id: string;
    scaleId?: string;
    scaleCode?: string;
    scaleName?: string;
    sessionId?: string;
    cycleId?: string;
    pondId?: string;
    zoneId?: string;
    status: string;
    batchNo: number;
    weight: number;
    deviceTimestamp?: string;
    confirmedAt?: string;
    confirmedBy?: string;
    confirmedByName?: string;
    deleteNote?: string | null;
    no?: number;
    creatorId?: string | null;
    editorId?: string | null;
    createdAt?: string;
    editedAt?: string;
    creator?: any | null;
    editor?: any | null;
}

export type GetScaleRecordsResponse = IApiResponse<IPaginate<IScaleRecord>>;
