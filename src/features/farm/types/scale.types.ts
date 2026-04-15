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
    zoneId: string;
    zoneName: string;
    code: string;
    name: string;
    type: ScaleType;
    usageStatus: ScaleUsageStatus;
    deviceId: string;
    isInstalled: boolean;
    installationDate: string;
    connectionStatus: ScaleConnectionStatus;
    creatorId: string | null;
    editorId: string | null;
    createdAt: string;
    editedAt: string;
    creator: ICreatorEditor | null;
    editor: ICreatorEditor | null;
}

export interface IScaleParams {
    SearchText?: string;
    ZoneId?: string;
    Type?: ScaleType;
    UsageStatus?: ScaleUsageStatus;
    ConnectionStatus?: ScaleConnectionStatus;
    IsInstalled?: boolean;
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
