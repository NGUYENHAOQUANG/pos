import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feedingRecordApi } from '@/features/farm/api/feedingRecordApi';
import {
    showAddJobSuccessToast,
    showEditJobSuccessToast,
    showDeleteJobSuccessToast,
} from '@/features/farm/utils/toastMessages';
import { farmKeys } from '@/features/farm/hooks/farmKeys';
import { JobExecution } from '@/features/farm/types/farm.types';
import type {
    FeedingRecordItem,
    FeedingRecordListParams,
    CreateFeedingRecordPayload,
} from '@/features/farm/types/feedingRecord.types';
import { useFarmMaterials } from '@/features/farm/hooks/useFarmMaterials';
import { feedingService } from '@/features/farm/services/feeding.service';
import { handleError } from '@/shared/utils';

export const useFeeding = () => {
    const { materials: allMaterials, isLoading } = useFarmMaterials();

    const materials = useMemo(() => {
        return feedingService.filterFeedingMaterials(allMaterials);
    }, [allMaterials]);

    return {
        materials,
        isLoading,
    };
};

export const useFeedingRecords = (pondId: string, params?: FeedingRecordListParams) => {
    return useQuery({
        queryKey: farmKeys.feedingRecords.list(pondId, params),
        queryFn: () => feedingRecordApi.list(pondId, params),
        enabled: !!pondId,
    });
};

export const useFeedingRecordsAsJobs = (pondId: string, params?: FeedingRecordListParams) => {
    const { data, isLoading, error, refetch } = useFeedingRecords(pondId, params);
    const { materialMap } = useFarmMaterials();

    const rawItems: FeedingRecordItem[] = data?.data?.items ?? [];

    const jobs: JobExecution[] = feedingService.mapRecordsToJobs(rawItems, materialMap);

    return { jobs, isLoading, error, refetch };
};

export const useCreateFeedingRecord = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            pondId,
            payload,
        }: {
            pondId: string;
            payload: CreateFeedingRecordPayload;
        }) => feedingRecordApi.create(pondId, payload),
        onSuccess: (_, { pondId }) => {
            queryClient.invalidateQueries({
                queryKey: farmKeys.feedingRecords.list(pondId),
            });
            queryClient.invalidateQueries({
                queryKey: ['warehouse-items'],
            });
            showAddJobSuccessToast('FEED');
        },
        onError: (error: any) => {
            handleError(error);
        },
    });
};

export const useUpdateFeedingRecord = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            pondId,
            id,
            payload,
        }: {
            pondId: string;
            id: string;
            payload: CreateFeedingRecordPayload;
        }) => feedingRecordApi.update(pondId, id, payload),
        onSuccess: (_, { pondId, id }) => {
            queryClient.invalidateQueries({
                queryKey: farmKeys.feedingRecords.list(pondId),
            });
            queryClient.invalidateQueries({
                queryKey: farmKeys.feedingRecords.detail(id),
            });
            queryClient.invalidateQueries({
                queryKey: ['warehouse-items'],
            });
            showEditJobSuccessToast('FEED');
        },
        onError: (error: any) => {
            handleError(error);
        },
    });
};

export const useDeleteFeedingRecord = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ pondId, id }: { pondId: string; id: string }) =>
            feedingRecordApi.delete(pondId, id),
        onSuccess: (_, { pondId, id }) => {
            queryClient.invalidateQueries({
                queryKey: farmKeys.feedingRecords.list(pondId),
            });
            queryClient.invalidateQueries({
                queryKey: farmKeys.feedingRecords.detail(id),
            });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
            showDeleteJobSuccessToast('FEED');
        },
        onError: (error: any) => {
            handleError(error);
        },
    });
};

export const useFeedingRecordDetail = (pondId: string, id: string) => {
    return useQuery({
        queryKey: farmKeys.feedingRecords.detail(id),
        queryFn: () => feedingRecordApi.getDetail(pondId, id),
        enabled: !!pondId && !!id,
    });
};
