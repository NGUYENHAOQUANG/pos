import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cleanRenovationApi } from '@/features/farm/api/cleanRenovationApi';

import { farmKeys } from './farmKeys';
import {
    ICleanRenovationParams,
    ICleanRenovationDetail,
} from '@/features/farm/types/cleanRenovation.types';
import { JobExecution } from '@/features/farm/types/farm.types';
import { useFarmMaterials } from '@/features/farm/hooks/useFarmMaterials';
import { cleanRenovationService } from '@/features/farm/services/handleProblem_Service/cleanRenovationService';

export const useCleanRenovations = (pondId: string, params?: ICleanRenovationParams) => {
    return useQuery({
        queryKey: farmKeys.cleanRenovations.byPond(pondId, params),
        queryFn: () => cleanRenovationApi.getAll(pondId, params),
        enabled: !!pondId,
    });
};

export const useCleanRenovationsAsJobs = (pondId: string, params?: ICleanRenovationParams) => {
    const { data, isLoading: isQueryLoading, error, refetch } = useCleanRenovations(pondId, params);
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
                const processedJobs = await cleanRenovationService.mapCleanRenovationsToJobs(
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

export const useCleanRenovation = (pondId: string, id: string) => {
    return useQuery({
        queryKey: farmKeys.cleanRenovations.detail(id),
        queryFn: () => cleanRenovationApi.getById(pondId, id),
        enabled: !!pondId && !!id,
    });
};

export const useCreateCleanRenovation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            pondId,
            detail,
            documentIds,
        }: {
            pondId: string;
            detail: ICleanRenovationDetail;
            documentIds?: string[];
        }) => cleanRenovationApi.create(pondId, detail, documentIds),
        onSuccess: (_, { pondId }) => {
            queryClient.invalidateQueries({
                queryKey: farmKeys.cleanRenovations.byPond(pondId),
            });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
            queryClient.invalidateQueries({ queryKey: ['warehouse-items'] });
        },
    });
};

export const useUpdateCleanRenovation = () => {
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
            detail: ICleanRenovationDetail;
            documentIds?: string[];
        }) => cleanRenovationApi.update(pondId, id, detail, documentIds),
        onSuccess: (_, { pondId, id }) => {
            queryClient.invalidateQueries({
                queryKey: farmKeys.cleanRenovations.byPond(pondId),
            });
            queryClient.invalidateQueries({
                queryKey: farmKeys.cleanRenovations.detail(id),
            });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
            queryClient.invalidateQueries({ queryKey: ['warehouse-items'] });
        },
    });
};

export const useDeleteCleanRenovation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ pondId, id }: { pondId: string; id: string }) =>
            cleanRenovationApi.delete(pondId, id),
        onSuccess: (_, { pondId }) => {
            queryClient.invalidateQueries({
                queryKey: farmKeys.cleanRenovations.byPond(pondId),
            });
            queryClient.invalidateQueries({ queryKey: farmKeys.pondRecords.all() });
            queryClient.invalidateQueries({ queryKey: ['warehouse-items'] });
        },
    });
};
