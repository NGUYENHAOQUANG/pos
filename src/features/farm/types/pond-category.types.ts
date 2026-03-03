import { IApiResponse, IPaginate, ICreatorEditor } from '@/shared/types/common.types';

export interface PondCategory {
    id: string;
    no?: number;
    name: string;
    description?: string;
    hasDevice?: boolean;
    pondCate?: string;
    creatorId?: string;
    editorId?: string | null;
    createdAt?: string;
    editedAt?: string;
    creator?: ICreatorEditor | null;
    editor?: ICreatorEditor | null;
}

export interface GetPondCategoriesParams {
    Name?: string;
    Id?: string;
    CreatedAt?: string;
    CreateAtFrom?: string;
    CreateAtTo?: string;
    Page?: number;
    PageSize?: number;
    OrderBy?: string;
}

export type GetPondCategoriesResponse = IApiResponse<IPaginate<PondCategory>>;
