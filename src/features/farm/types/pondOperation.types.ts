import { IApiResponse } from '@/shared/types/common.types';

export interface OperationType {
    id: number;
    name: string;
    associatedTable?: string;
    createdAt?: string;
    lastModifiedAt?: string;
}

export interface PondTypeOperation {
    id: string;
    pondCategoryId: string;
    operationId: string;
    operationName: string;
    pondName?: string;
    no?: number;
    isMandatory?: boolean;
    defaultScheduleDay?: number;
    priority?: number;
    createdAt?: string;
    lastModifiedAt?: string;
    code?: string;
    operationTypeName?: string;
}

export interface GetPondOperationsParams {
    Page?: number;
    PageSize?: number;
    PondCategoryId?: string;
    SearchTerm?: string;
    [key: string]: any;
}

export type GetPondOperationsResponse = IApiResponse<PondTypeOperation[]>;
