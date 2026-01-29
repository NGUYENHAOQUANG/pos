import { IApiResponse as IAppResponse, IPaginate } from '@/shared/types/common.types';

export interface ISupplier {
    id: string;
    name: string;
    address?: string;
    phoneNumber?: string;
    email?: string;
    description?: string;
}

export interface GetSuppliersParams {
    SearchText?: string;
    Id?: string;
    CreatedAt?: string;
    CreateAtFrom?: string;
    CreateAtTo?: string;
    Page?: number;
    PageSize?: number;
    OrderBy?: string;
}

export type GetSuppliersResponse = IAppResponse<IPaginate<ISupplier>>;
