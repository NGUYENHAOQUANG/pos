import React from 'react';
import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { memberApi } from '../api/member.api';
import { GetUsersParams, CreateUserPayload } from '../types/member.types';
import { handleError } from '@/shared/utils/errorHandler';
import Toast from 'react-native-toast-message';

export const memberKeys = {
    all: ['members'] as const,
    lists: () => [...memberKeys.all, 'list'] as const,
    list: (filters: string) => [...memberKeys.lists(), { filters }] as const,
    details: () => [...memberKeys.all, 'detail'] as const,
    detail: (id: string) => [...memberKeys.details(), id] as const,
    roles: () => [...memberKeys.all, 'roles'] as const,
    rolePolicies: (roleId: string) => [...memberKeys.all, 'rolePolicies', roleId] as const,
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

export const useRolePolicies = (roleId: string | undefined) => {
    return useQuery({
        queryKey: memberKeys.rolePolicies(roleId || ''),
        queryFn: async () => {
            const response = await memberApi.getRolePolicies(roleId!);
            return response.data;
        },
        enabled: !!roleId,
        staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    });
};

/**
 * Prefetch policies for all available roles in parallel.
 * Call this when the form mounts so switching roles is instant.
 */
export const usePrefetchRolePolicies = (roleIds: string[]) => {
    const queryClient = useQueryClient();

    React.useEffect(() => {
        roleIds.forEach((id: string) => {
            queryClient.prefetchQuery({
                queryKey: memberKeys.rolePolicies(id),
                queryFn: async () => {
                    const response = await memberApi.getRolePolicies(id);
                    return response.data;
                },
                staleTime: 10 * 60 * 1000,
            });
        });
    }, [roleIds, queryClient]);
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
        mutationFn: async (payload: CreateUserPayload) => {
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

    interface UpdateStatusParams {
        id: string;
        status: string;
        fullName: string;
        roleId?: string;
        zoneId?: string;
    }

    return useMutation({
        mutationFn: async ({ id, status, fullName, roleId, zoneId }: UpdateStatusParams) => {
            const isActive = status === 'active';
            return await memberApi.updateMemberAdmin(id, {
                fullName,
                roleId,
                isActive,
                zoneId,
            });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: memberKeys.lists() });
            queryClient.invalidateQueries({ queryKey: memberKeys.detail(variables.id) });
            const message =
                variables.status === 'active'
                    ? 'Đã kích hoạt lại tài khoản'
                    : 'Đã tạm ngưng tài khoản';
            Toast.show({
                type: 'success',
                text1: 'Thành công',
                text2: message,
            });
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

export const useUpdateMemberAdmin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            payload,
        }: {
            id: string;
            payload: import('../types/member.types').UpdateUserPayload;
        }) => {
            return await memberApi.updateMemberAdmin(id, payload);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: memberKeys.lists() });
            queryClient.invalidateQueries({ queryKey: memberKeys.detail(variables.id) });
            Toast.show({
                type: 'success',
                text1: 'Thành công',
                text2: 'Đã cập nhật vai trò thành viên',
            });
        },
        onError: error => {
            handleError(error);
        },
    });
};
