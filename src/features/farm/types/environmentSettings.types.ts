import { ICreatorEditor, IApiResponse, IPaginate } from '@/shared/types/common.types';

export interface EnvironmentSetting {
    id: string;
    zoneId: string;
    metricId: string;
    minValue: number;
    maxValue: number;
    isActive: boolean;
    no: number;
    creatorId: string;
    editorId: string | null;
    createdAt: string;
    editedAt: string;
    creator: ICreatorEditor | null;
    editor: ICreatorEditor | null;
}

export interface GetEnvironmentSettingsParams {
    ZoneId?: string;
    Id?: string;
    CreatedAt?: string;
    CreateAtFrom?: string;
    CreateAtTo?: string;
    Page?: number;
    PageSize?: number;
    OrderBy?: string;
}

export type GetEnvironmentSettingsResponse = IApiResponse<IPaginate<EnvironmentSetting>>;

export interface CreateEnvironmentSettingRequest {
    metricId: string;
    minValue: number;
    maxValue: number;
    isActive: boolean;
}

export type CreateEnvironmentSettingResponse = IApiResponse<EnvironmentSetting>;

export type GetEnvironmentSettingDetailResponse = IApiResponse<EnvironmentSetting>;

// Update
export type UpdateEnvironmentSettingRequest = CreateEnvironmentSettingRequest;
export type UpdateEnvironmentSettingResponse = IApiResponse<EnvironmentSetting>;

export type DeleteEnvironmentSettingResponse = IApiResponse<object>;
