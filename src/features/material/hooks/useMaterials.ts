import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { materialApi } from '@/features/material/api/materialApi';
import { materialGroupApi } from '@/features/material/api/materialGroupApi';
import { materialTypeApi } from '@/features/material/api/materialTypeApi';
import { unitApi } from '@/features/material/api/unitApi';
import {
    CreateMaterialRequest,
    UpdateMaterialRequest,
    GetMaterialsParams,
    MaterialResponse,
    IMaterial,
    IMaterialGroup,
    IMaterialType,
} from '@/features/material/types/material.types';
import { showSuccessToast, showErrorToast } from '@/features/material/utils/validationToast';
import { getErrorMessage } from '@/features/material/utils/errorHandlers';

// Constants for pagination
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 100;

// Constants for staleTime (in milliseconds)
const STALE_TIME_SHORT = 2 * 60 * 1000; // 2 minutes
const STALE_TIME_LONG = 5 * 60 * 1000; // 5 minutes

// Query Keys
export const materialKeys = {
    all: ['materials'] as const,
    lists: () => [...materialKeys.all, 'list'] as const,
    list: (params?: GetMaterialsParams) => [...materialKeys.lists(), params] as const,
    details: () => [...materialKeys.all, 'detail'] as const,
    detail: (id: number) => [...materialKeys.details(), id] as const,
    groups: () => [...materialKeys.all, 'groups'] as const,
    types: () => [...materialKeys.all, 'types'] as const,
    typesByGroup: (groupName: string) => [...materialKeys.types(), 'by-group', groupName] as const,
    units: () => [...materialKeys.all, 'units'] as const,
};

// Helper function to map MaterialResponse to IMaterial
const mapMaterialResponse = (
    item: MaterialResponse,
    groups: IMaterialGroup[],
    types: IMaterialType[]
): IMaterial => {
    const group = item.materialGroupId
        ? groups.find(g => g.id === item.materialGroupId)?.name || ''
        : '';

    const type = item.materialTypeId
        ? types.find(t => t.id === item.materialTypeId)?.name || ''
        : '';

    return {
        id: item.id.toString(),
        name: item.name || '',
        group: group,
        type: type,
        unit: item.unitId,
        unitName: item.unitName || undefined,
        manufacturer: item.manufacturer || undefined,
        usage: item.description || undefined,
        remaining: 0,
    };
};

/**
 * Hook to fetch material groups
 */
export const useMaterialGroups = () => {
    return useQuery({
        queryKey: materialKeys.groups(),
        queryFn: async () => {
            const response = await materialGroupApi.getAll({
                Page: DEFAULT_PAGE,
                PageSize: DEFAULT_PAGE_SIZE,
            });
            if (response.result && response.data?.items) {
                return response.data.items;
            }
            throw new Error(response.message || 'Không thể tải nhóm vật tư');
        },
        staleTime: STALE_TIME_LONG,
    });
};

/**
 * Hook to fetch all material types
 */
export const useMaterialTypes = () => {
    return useQuery({
        queryKey: materialKeys.types(),
        queryFn: async () => {
            const response = await materialTypeApi.getList({
                Page: DEFAULT_PAGE,
                PageSize: DEFAULT_PAGE_SIZE,
            });
            if (response.result && response.data?.items) {
                return response.data.items;
            }
            throw new Error(response.message || 'Không thể tải loại vật tư');
        },
        staleTime: STALE_TIME_LONG,
    });
};

/**
 * Hook to fetch material types by group name
 */
export const useMaterialTypesByGroup = (groupName: string | null) => {
    const { data: groups } = useMaterialGroups();

    return useQuery({
        queryKey: materialKeys.typesByGroup(groupName || ''),
        queryFn: async () => {
            if (!groupName || !groups) return [];

            const selectedGroup = groups.find(g => g.name === groupName);
            if (!selectedGroup) return [];

            const response = await materialTypeApi.getList({
                Page: DEFAULT_PAGE,
                PageSize: DEFAULT_PAGE_SIZE,
            });

            if (response.result && response.data?.items) {
                return (response.data.items || []).filter(
                    item => item.materialGroupId === selectedGroup.id
                );
            }
            throw new Error(response.message || 'Không thể tải loại vật tư');
        },
        enabled: !!groupName && !!groups,
        staleTime: STALE_TIME_LONG,
    });
};

/**
 * Hook to fetch units
 */
export const useUnits = () => {
    return useQuery({
        queryKey: materialKeys.units(),
        queryFn: async () => {
            const response = await unitApi.getUnits();
            if (response.data && response.data.items) {
                return response.data.items;
            }
            throw new Error('Không thể tải đơn vị tính');
        },
        staleTime: STALE_TIME_LONG,
    });
};

/**
 * Hook to fetch materials with filters
 */
export const useMaterials = (params?: GetMaterialsParams) => {
    const queryClient = useQueryClient();
    const { data: groups = [], isLoading: isLoadingGroups } = useMaterialGroups();
    const { data: types = [], isLoading: isLoadingTypes } = useMaterialTypes();

    // Only enable query when groups and types are loaded (required for mapping)
    const isReadyForMapping =
        !isLoadingGroups && !isLoadingTypes && groups.length > 0 && types.length > 0;

    const query = useQuery({
        queryKey: materialKeys.list(params),
        queryFn: async () => {
            const response = await materialApi.getAll(params);
            if (response.result && response.data?.items) {
                // Get current groups and types at query time (guaranteed to be available)
                const currentGroups = groups.length > 0 ? groups : [];
                const currentTypes = types.length > 0 ? types : [];

                // Map materials with groups and types (mapping happens here)
                return (response.data.items || []).map((item: MaterialResponse) =>
                    mapMaterialResponse(item, currentGroups, currentTypes)
                );
            }
            throw new Error(response.message || 'Không thể tải danh sách vật tư');
        },
        enabled: isReadyForMapping,
        staleTime: STALE_TIME_SHORT,
    });

    // Refetch materials when groups/types finish loading to update mappings
    React.useEffect(() => {
        if (isReadyForMapping && query.data) {
            // Invalidate to refetch with updated groups/types for proper mapping
            const queryKey = materialKeys.list(params);
            queryClient.invalidateQueries({ queryKey });
        }
    }, [isReadyForMapping, query.data, queryClient, params]);

    // Combined loading state: true if groups/types are loading OR materials are loading/mapping
    // This ensures UI shows loading during the entire mapping process
    const isLoading = isLoadingGroups || isLoadingTypes || query.isLoading;

    return {
        ...query,
        isLoading, // Override isLoading to include groups/types loading
        data: query.data || [], // Ensure data is always an array
    };
};

/**
 * Hook to fetch a single material by ID
 */
export const useMaterial = (id: number | null) => {
    const { data: groups = [], isLoading: isLoadingGroups } = useMaterialGroups();
    const { data: types = [], isLoading: isLoadingTypes } = useMaterialTypes();

    return useQuery({
        queryKey: materialKeys.detail(id || 0),
        queryFn: async () => {
            if (!id) throw new Error('Material ID is required');
            const response = await materialApi.getById(id);
            if (response.result && response.data) {
                // Get fresh groups and types for mapping
                const currentGroups = groups.length > 0 ? groups : [];
                const currentTypes = types.length > 0 ? types : [];
                return mapMaterialResponse(response.data, currentGroups, currentTypes);
            }
            throw new Error(response.message || 'Không thể tải thông tin vật tư');
        },
        enabled: !!id && !isLoadingGroups && !isLoadingTypes,
    });
};

/**
 * Hook to create a new material
 */
export const useCreateMaterial = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: CreateMaterialRequest) => materialApi.create(request),
        onSuccess: () => {
            showSuccessToast('Tạo vật tư thành công');
            // Invalidate materials list to refetch
            queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
        },
        onError: (error: unknown) => {
            const errorMessage = getErrorMessage(error, 'Tạo vật tư thất bại');
            showErrorToast(errorMessage);
        },
    });
};

/**
 * Hook to update an existing material
 */
export const useUpdateMaterial = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, request }: { id: number; request: UpdateMaterialRequest }) =>
            materialApi.update(id, request),
        onSuccess: (_, variables) => {
            showSuccessToast('Cập nhật thông tin vật tư thành công');
            // Invalidate both list and detail queries
            queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
            queryClient.invalidateQueries({ queryKey: materialKeys.detail(variables.id) });
        },
        onError: (error: unknown) => {
            const errorMessage = getErrorMessage(error, 'Cập nhật vật tư thất bại');
            showErrorToast(errorMessage);
        },
    });
};

/**
 * Hook to delete a material
 */
export const useDeleteMaterial = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => materialApi.delete(id),
        onSuccess: () => {
            showSuccessToast('Xóa vật tư thành công');
            // Invalidate materials list
            queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
        },
        onError: (error: unknown) => {
            const errorMessage = getErrorMessage(error, 'Xóa vật tư thất bại');
            showErrorToast(errorMessage);
        },
    });
};
