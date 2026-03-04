import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dryRenovationApi } from '@/features/farm/api/dryRenovationApi';

import { farmKeys } from '@/features/farm/hooks/farmKeys';
import {
    IDryRenovationParams,
    IDryRenovationDetail,
} from '@/features/farm/types/dryRenovation.types';
import { JobExecution } from '@/features/farm/types/farm.types';
import { useFarmMaterials } from '@/features/farm/hooks/useFarmMaterials';
import { dryRenovationService } from '@/features/farm/services/handleproblem-service/dryRenovation.service';

export const useDryRenovations = (pondId: string, params?: IDryRenovationParams) => {
    return useQuery({
        queryKey: farmKeys.dryRenovations.byPond(pondId, params),
        queryFn: () => dryRenovationApi.getAll(pondId, params),
        enabled: !!pondId,
    });
};

export const useDryRenovationsAsJobs = (pondId: string, params?: IDryRenovationParams) => {
    const { data, isLoading: isQueryLoading, error, refetch } = useDryRenovations(pondId, params);
    const { materialMap } = useFarmMaterials();
    const [jobs, setJobs] = useState<JobExecution[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const processData = async () => {
            if (!data?.data?.items) {
                if (isMounted) setJobs([]);
                return;
            }

            setIsProcessing(true);
            try {
                const processedJobs = await dryRenovationService.mapDryRenovationsToJobs(
                    data.data.items,
                    materialMap
                );
                if (isMounted) setJobs(processedJobs);
            } catch (_err) {
                if (isMounted) setJobs([]);
            } finally {
                if (isMounted) setIsProcessing(false);
            }
        };

        processData();
        return () => {
            isMounted = false;
        };
    }, [data, materialMap]);

    return { jobs, isLoading: isQueryLoading || isProcessing, error, refetch };
};

export const useDryRenovation = (pondId: string, id: string) => {
    return useQuery({
        queryKey: farmKeys.dryRenovations.detail(id),
        queryFn: () => dryRenovationApi.getById(pondId, id),
        enabled: !!pondId && !!id,
    });
};

export const useCreateDryRenovation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            pondId,
            detail,
            documentIds,
        }: {
            pondId: string;
            detail: IDryRenovationDetail;
            documentIds?: string[];
        }) => dryRenovationApi.create(pondId, detail, documentIds),
        onSuccess: (_, { pondId }) => {
            queryClient.invalidateQueries({
                queryKey: farmKeys.dryRenovations.byPond(pondId),
            });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
            queryClient.invalidateQueries({ queryKey: ['warehouse-items'] });
        },
    });
};

export const useUpdateDryRenovation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            pondId,
            id,
            detail,
            documentIds,
        }: {
            pondId: string;
            id: string;
            detail: IDryRenovationDetail;
            documentIds?: string[];
        }) => dryRenovationApi.update(pondId, id, detail, documentIds),
        onSuccess: (_, { pondId, id }) => {
            queryClient.invalidateQueries({
                queryKey: farmKeys.dryRenovations.byPond(pondId),
            });
            queryClient.invalidateQueries({
                queryKey: farmKeys.dryRenovations.detail(id),
            });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
            queryClient.invalidateQueries({ queryKey: ['warehouse-items'] });
        },
    });
};

export const useDeleteDryRenovation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ pondId, id }: { pondId: string; id: string }) =>
            dryRenovationApi.delete(pondId, id),
        onSuccess: (_, { pondId }) => {
            queryClient.invalidateQueries({
                queryKey: farmKeys.dryRenovations.byPond(pondId),
            });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
            queryClient.invalidateQueries({ queryKey: ['warehouse-items'] });
        },
    });
};
