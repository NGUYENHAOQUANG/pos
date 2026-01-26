import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { materialApi } from '@/features/material/api/materialApi';
import { IMaterial, IMaterialType } from '@/features/material/types/material.types';
import {
    IMaterialGroupV2,
    CreateMaterialV2Request,
    UpdateMaterialV2Request,
    GetMaterialsV2Params,
    MaterialResponseV2,
} from '@/features/material/types/materialGroup.types';
import { showSuccessToast, showErrorToast } from '@/features/material/utils/validationToast';
import { getErrorMessage } from '@/features/material/utils/errorHandlers';
import { useMaterialGroups } from './useMaterialGroups';
import { useMaterialTypes } from '@/features/material/hooks/useMaterialTypes';
import { materialKeys } from '@/features/material/hooks/materialKeys';

// Constants for staleTime (in milliseconds)
const STALE_TIME_SHORT = 2 * 60 * 1000; // 2 minutes

// Helper function to map MaterialResponseV2 to IMaterial
const mapMaterialResponse = (
    item: MaterialResponseV2,
    groups: IMaterialGroupV2[],
    types: IMaterialType[]
): IMaterial => {
    // Note: materialGroupId is number but groups now have string IDs (UUID)
    // We need to match by converting or updating the backend to use consistent IDs
    const group = item.materialGroupId ? groups.find(g => g.name)?.name || '' : '';

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
        isActive: item.isActive ?? true, // Default to true if undefined
    };
};

/**
 * Hook to fetch materials with filters
 */
export const useMaterials = (params?: GetMaterialsV2Params) => {
    const { data: groups = [], isLoading: isLoadingGroups } = useMaterialGroups();
    const { data: types = [], isLoading: isLoadingTypes } = useMaterialTypes();

    // Parallel fetching: No longer dependent on groups/types loading
    const query = useQuery({
        queryKey: materialKeys.list(params),
        queryFn: async () => {
            const response = await materialApi.getAll(params);
            if (response.success && response.data?.items) {
                // Return raw data
                return response.data.items;
            }
            throw new Error(response.message || 'Không thể tải danh sách vật tư');
        },
        staleTime: STALE_TIME_SHORT,
    });

    // Map data on client side whenever dependencies change
    const mappedData = React.useMemo(() => {
        if (!query.data) return [];
        return query.data.map((item: MaterialResponseV2) =>
            mapMaterialResponse(item, groups, types)
        );
    }, [query.data, groups, types]);

    // Combined loading state
    const isLoading = isLoadingGroups || isLoadingTypes || query.isLoading;

    return {
        ...query,
        isLoading,
        data: mappedData,
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
            if (response.success && response.data) {
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
        mutationFn: (request: CreateMaterialV2Request) => materialApi.create(request),
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
        mutationFn: ({ id, request }: { id: number; request: UpdateMaterialV2Request }) =>
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
