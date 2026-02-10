import React from 'react';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { materialApi } from '@/features/material/api/materialApi';
import {
    IMaterial,
    IMaterialType,
    MaterialGroupType,
} from '@/features/material/types/material.types';
import { IMaterialGroupV2 } from '@/features/material/types/materialGroup.types';
import {
    CreateMaterialV2Request,
    UpdateMaterialV2Request,
    GetMaterialsParams,
    MaterialResponseV2,
} from '@/features/material/types/material.types';
import { showSuccessToast } from '@/features/material/utils/validationToast';
import { useMaterialGroups } from '@/features/material/hooks/useMaterialGroups';
import { useMaterialTypes } from '@/features/material/hooks/useMaterialTypes';
import { materialKeys } from '@/features/material/hooks/materialKeys';
import { APP_CONFIG } from '@/shared/constants';
import { handleError } from '@/shared/utils';

const STALE_TIME_SHORT = 2 * 60 * 1000;

const mapMaterialResponse = (
    item: MaterialResponseV2,
    groupMap: Map<any, IMaterialGroupV2>,
    typeMap: Map<any, IMaterialType>
): IMaterial => {
    const group = item.materialGroupId ? groupMap.get(item.materialGroupId) : undefined;
    const type = item.materialTypeId ? typeMap.get(item.materialTypeId) : undefined;

    return {
        id: item.id,
        name: item.name || '',
        group: (group?.name || '') as MaterialGroupType,
        groupId: item.materialGroupId,
        type: type?.name || '',
        typeId: item.materialTypeId,
        unit: item.unitId,
        unitName: item.unitName || undefined,
        manufacturer: item.manufacturer || undefined,
        usage: item.description || undefined,
        remaining: 0,
        isActive: item.isActive ?? true,
    };
};

/**
 * Hook to fetch materials with filters
 */
export const useMaterials = (params?: GetMaterialsParams, options?: { enabled?: boolean }) => {
    const { data: groups = [], isLoading: isLoadingGroups } = useMaterialGroups();
    const { data: types = [], isLoading: isLoadingTypes } = useMaterialTypes();

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
        enabled: options?.enabled,
    });

    const groupMap = React.useMemo(() => new Map(groups.map(g => [g.id, g])), [groups]);
    const typeMap = React.useMemo(() => new Map(types.map(t => [t.id, t])), [types]);

    // Map data on client side whenever dependencies change
    const mappedData = React.useMemo(() => {
        if (!query.data) return [];
        return query.data.map((item: MaterialResponseV2) =>
            mapMaterialResponse(item, groupMap, typeMap)
        );
    }, [query.data, groupMap, typeMap]);

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
export const useMaterial = (id: string | null) => {
    const { data: groups = [], isLoading: isLoadingGroups } = useMaterialGroups();
    const { data: types = [], isLoading: isLoadingTypes } = useMaterialTypes();

    return useQuery({
        queryKey: materialKeys.detail(id || ''),
        queryFn: async () => {
            if (!id) throw new Error('Material ID is required');
            const response = await materialApi.getById(id);
            if (response.success && response.data) {
                // Get fresh groups and types for mapping
                const currentGroups = groups.length > 0 ? groups : [];
                const currentTypes = types.length > 0 ? types : [];
                const groupMap = new Map(currentGroups.map(g => [g.id, g]));
                const typeMap = new Map(currentTypes.map(t => [t.id, t]));

                return mapMaterialResponse(response.data, groupMap, typeMap);
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
        mutationFn: (request: CreateMaterialV2Request) => {
            return materialApi.create(request);
        },
        onSuccess: () => {
            showSuccessToast('Tạo vật tư thành công');
            // Invalidate materials list to refetch
            queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
        },
        onError: error => {
            handleError(error);
        },
    });
};

/**
 * Hook to update an existing material
 */
export const useUpdateMaterial = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, request }: { id: string; request: UpdateMaterialV2Request }) =>
            materialApi.update(id, request),
        onSuccess: (_, variables) => {
            showSuccessToast('Cập nhật thông tin vật tư thành công');
            queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
            queryClient.invalidateQueries({ queryKey: materialKeys.detail(variables.id) });
        },
        onError: error => {
            handleError(error);
        },
    });
};

/**
 * Hook to delete a material
 */
export const useDeleteMaterial = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => materialApi.delete(id),
        onSuccess: () => {
            showSuccessToast('Xóa vật tư thành công');
            // Invalidate materials list
            queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
        },
        onError: error => {
            handleError(error);
        },
    });
};
/**
 * Hook to fetch materials with infinite scroll
 * Default page size = 20
 */
export const useInfiniteMaterials = (
    params?: Omit<GetMaterialsParams, 'Page' | 'PageSize'>,
    options?: { enabled?: boolean }
) => {
    const { data: groups = [] } = useMaterialGroups();
    const { data: types = [] } = useMaterialTypes();

    const query = useInfiniteQuery({
        queryKey: [...materialKeys.list(params || {}), 'infinite'],
        queryFn: async ({ pageParam = 1 }) => {
            const pageSize = APP_CONFIG.DEFAULT_PAGE_SIZE;
            const currentParams = {
                ...params,
                Page: pageParam,
                PageSize: pageSize,
            };

            const response = await materialApi.getAll(currentParams);
            if (response.success && response.data?.items) {
                return response.data;
            }
            throw new Error(response.message || 'Không thể tải danh sách vật tư');
        },
        initialPageParam: 1,
        getNextPageParam: lastPage => {
            if (!lastPage.hasNextPage) return undefined;
            return lastPage.pageNumber + 1;
        },
        staleTime: STALE_TIME_SHORT,
        enabled: options?.enabled,
    });

    const groupMap = React.useMemo(() => new Map(groups.map(g => [g.id, g])), [groups]);
    const typeMap = React.useMemo(() => new Map(types.map(t => [t.id, t])), [types]);

    // Flatten data
    const materials = React.useMemo(() => {
        if (!query.data) return [];
        return query.data.pages.reduce((acc: IMaterial[], page) => {
            const items = page.items || [];
            const mappedItems = items.map((item: MaterialResponseV2) =>
                mapMaterialResponse(item, groupMap, typeMap)
            );
            return [...acc, ...mappedItems];
        }, []);
    }, [query.data, groupMap, typeMap]);

    return {
        ...query,
        data: materials,
        total: query.data?.pages[0]?.totalCount || 0,
    };
};
