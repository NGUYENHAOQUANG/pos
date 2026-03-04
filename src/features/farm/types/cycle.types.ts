import type { IApiResponse, ICreatorEditor } from '@/shared/types/common.types';
import type { PondData } from '@/features/farm/types/pond.types';

export interface ICycleSeason {
    zoneId: string;
    name: string;
    code: string | null;
    startDate: string;
    endDate: string | null;
    status: string;
    notes: string | null;
    id: string;
    no: number;
    creatorId: string | null;
    editorId: string | null;
    createdAt: string;
    editedAt: string;
    creator?: ICreatorEditor | null;
    editor?: ICreatorEditor | null;
}

export interface ICycleItem {
    warehouseItemId: string | null;
    code: string | null;
    name: string | null;
    endDate: string | null;
    status: string;
    notes: string | null;
    density: number;
    totalStocking: number;
    ageDays: number;
    season: ICycleSeason;
    pond: PondData;
    id: string;
    no: number;
    creatorId: string | null;
    editorId: string | null;
    createdAt: string;
    editedAt: string;
    creator?: ICreatorEditor | null;
    editor?: ICreatorEditor | null;
}

export type ICycleDetailResponse = IApiResponse<ICycleItem>;
