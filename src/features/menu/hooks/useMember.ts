import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { memberApi } from '../api/member.api';
import { GetUsersParams } from '../types/member.types';
import { handleError } from '@/shared/utils/errorHandler';
import Toast from 'react-native-toast-message';

export const memberKeys = {
    all: ['members'] as const,
    lists: () => [...memberKeys.all, 'list'] as const,
    list: (filters: string) => [...memberKeys.lists(), { filters }] as const,
    details: () => [...memberKeys.all, 'detail'] as const,
    detail: (id: string) => [...memberKeys.details(), id] as const,
    roles: () => [...memberKeys.all, 'roles'] as const,
};

export const useRoles = () => {
    return useQuery({
        queryKey: memberKeys.roles(),
        queryFn: async () => {
            try {
                const response = await memberApi.getRoles();
                console.log('response roles:', response);
                return response.data;
            } catch (error) {
                console.error('Lỗi khi lấy roles:', error);
                throw error;
            }
        },
    });
};

export const useMembers = (params?: GetUsersParams) => {
    return useInfiniteQuery({
        queryKey: memberKeys.list(JSON.stringify(params)),
        queryFn: async ({ pageParam = 1 }) => {
            const response = await memberApi.getMembers({
                ...params,
                Page: pageParam,
                PageSize: 20,
            });
            return response.data as any;
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage: any) => {
            if (lastPage && lastPage.hasNextPage) {
                return lastPage.pageNumber + 1;
            }
            return undefined;
        },
    });
};

export const useCreateMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: any) => {
            return await memberApi.createMember(payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: memberKeys.lists() });
            Toast.show({
                type: 'success',
                text1: 'Thành công',
                text2: 'Đã thêm thành viên mới',
            });
        },
        onError: error => {
            handleError(error);
        },
    });
};

export const useUpdateMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
            return await memberApi.updateMember(id, payload);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: memberKeys.lists() });
            queryClient.invalidateQueries({ queryKey: memberKeys.detail(variables.id) });
        },
        onError: error => {
            handleError(error);
        },
    });
};

export const useUpdateMemberStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            return await memberApi.updateStatus(id, status);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: memberKeys.lists() });
            queryClient.invalidateQueries({ queryKey: memberKeys.detail(variables.id) });
        },
        onError: error => {
            handleError(error);
        },
    });
};

export const useDeleteMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            return await memberApi.deleteMember(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: memberKeys.lists() });
        },
        onError: error => {
            handleError(error);
        },
    });
};
