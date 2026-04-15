import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { IApiResponse, IPaginate } from '@/shared/types/common.types';
import { IUserAccount, GetUsersParams, IRole } from '../types/member.types';

export const memberApi = {
    getRoles: async (): Promise<IApiResponse<IRole[]>> => {
        const { data } = await apiClient.get<IApiResponse<IRole[]>>(API_ENDPOINTS.MEMBER.ROLES);
        return data;
    },

    getMembers: async (
        params?: GetUsersParams
    ): Promise<IApiResponse<IPaginate<IUserAccount> | IUserAccount[]>> => {
        const { data } = await apiClient.get<
            IApiResponse<IPaginate<IUserAccount> | IUserAccount[]>
        >(API_ENDPOINTS.MEMBER.LIST, { params });
        return data;
    },

    createMember: async (payload: any): Promise<IApiResponse<IUserAccount>> => {
        const { data } = await apiClient.post<IApiResponse<IUserAccount>>(
            API_ENDPOINTS.MEMBER.CREATE,
            payload
        );
        return data;
    },

    updateMember: async (id: string, payload: any): Promise<IApiResponse<IUserAccount>> => {
        const { data } = await apiClient.patch<IApiResponse<IUserAccount>>(
            API_ENDPOINTS.MEMBER.UPDATE(id),
            payload
        );
        return data;
    },

    updateStatus: async (id: string, status: string): Promise<IApiResponse<null>> => {
        const { data } = await apiClient.patch<IApiResponse<null>>(
            API_ENDPOINTS.MEMBER.UPDATE_STATUS(id),
            { status }
        );
        return data;
    },

    deleteMember: async (id: string): Promise<IApiResponse<null>> => {
        const { data } = await apiClient.delete<IApiResponse<null>>(
            API_ENDPOINTS.MEMBER.DELETE(id)
        );
        return data;
    },
};
