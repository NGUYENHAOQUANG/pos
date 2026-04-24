import { IApiResponse, IPaginate, ICreatorEditor } from '@/shared/types/common.types';

export enum ScaleType {
    Kg500 = 'Kg500',
    Kg1000 = 'Kg1000',
}

export enum ScaleUsageStatus {
    Free = 'Free',
    Using = 'Using',
}

export enum ScaleConnectionStatus {
    UnDefined = 'UnDefined',
    Connected = 'Connected',
    DisConnected = 'DisConnected',
}

export interface IScale {
    id: string;
    no: number;
    zoneId?: string;
    occupiedByUserId?: string | null;
    occupiedByUserName?: string | null;
    currentCycleId?: string | null;
    isOccupiedByCurrentUser?: boolean;
    zoneName?: string;
    code: string;
    name: string;
    type: ScaleType;
    usageStatus: ScaleUsageStatus;
    deviceId?: string | null;
    isInstalled: boolean;
    installationDate?: string | null;
    connectionStatus: ScaleConnectionStatus;
    creatorId?: string | null;
    editorId?: string | null;
    createdAt: string;
    editedAt?: string | null;
    creator?: ICreatorEditor | null;
    editor?: ICreatorEditor | null;
}

export interface IScaleParams {
    SearchText?: string;
    ZoneId?: string;
    Type?: ScaleType;
    UsageStatus?: ScaleUsageStatus;
    ConnectionStatus?: ScaleConnectionStatus;
    IsInstalled?: boolean;
    CurrentCycleId?: string;
    Id?: string;
    CreatedAt?: string;
    CreateAtFrom?: string;
    CreateAtTo?: string;
    Page?: number;
    PageSize?: number;
    OrderBy?: string;
}

export type GetScalesResponse = IApiResponse<IPaginate<IScale>>;
export type ScaleResponse = IApiResponse<IScale>;

export interface IUpdateScaleUsageStatusRequest {
    scaleIds: string[];
    status: ScaleUsageStatus | string;
    cycleId: string;
}

export enum LiveWeightState {
    Connected = 'Connected',
    Disconnected = 'Disconnected',
    Standby = 'Standby',
    Measuring = 'Measuring',
    Stable = 'Stable',
    Error = 'Error',
    Zero = 'Zero',
    Tare = 'Tare',
}

export interface ILiveWeight {
    deviceId: string;
    sessionId: string | null;
    gross: number;
    net: number;
    unit: string;
    state: LiveWeightState;
    canConfirm: boolean;
    freshnessSeconds: number;
    lastUpdatedUtc: string;
}
